const mongoose = require("mongoose");
const { v4: uuid } = require("uuid");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const LedgerEntry = require("../models/LedgerEntry");
const ApiError = require("../utils/ApiError");
const transactionEvents = require("../events/transaction.events");
const logger = require("../utils/logger");

const generateReference = () => `TXN-${uuid().replace(/-/g, "").toUpperCase()}`;

/**
 * Applies a balance change to an account using optimistic locking.
 * Throws if the account was modified concurrently (version mismatch) or
 * if the resulting balance would go negative.
 */
const applyLedgerMovement = async ({
  session,
  account,
  type,
  amount,
  transactionId,
}) => {
  const delta = type === "CREDIT" ? amount : -amount;

  if (type === "DEBIT" && account.balance < amount) {
    throw ApiError.badRequest(
      `Insufficient funds in account ${account.accountNumber}`,
    );
  }

  const updated = await Account.findOneAndUpdate(
    { _id: account._id, version: account.version }, // optimistic lock check
    { $inc: { balance: delta, version: 1 } },
    { new: true, session },
  );

  if (!updated) {
    // Someone else modified this account between our read and write.
    throw ApiError.conflict(
      `Account ${account.accountNumber} was modified concurrently, please retry`,
    );
  }

  await LedgerEntry.create(
    [
      {
        transaction: transactionId,
        account: account._id,
        type,
        amount,
        balanceAfter: updated.balance,
      },
    ],
    { session },
  );

  return updated;
};

const findActiveAccountOrThrow = async (accountNumber, session) => {
  const account = await Account.findOne({ accountNumber }).session(session);
  if (!account) throw ApiError.notFound(`Account ${accountNumber} not found`);
  if (account.status !== "ACTIVE") {
    throw ApiError.badRequest(
      `Account ${accountNumber} is ${account.status}, cannot process`,
    );
  }
  return account;
};

const checkIdempotency = async (idempotencyKey) => {
  if (!idempotencyKey) return null;
  const existing = await Transaction.findOne({ idempotencyKey });
  return existing;
};

/**
 * Core money-movement function. Runs everything inside a single MongoDB
 * session/transaction: either both the debit and credit (and their ledger
 * entries) succeed, or nothing is persisted at all.
 */
const transfer = async ({
  fromAccountNumber,
  toAccountNumber,
  amount,
  idempotencyKey,
  initiatedBy,
}) => {
  if (fromAccountNumber === toAccountNumber) {
    throw ApiError.badRequest("Cannot transfer to the same account");
  }

  const existing = await checkIdempotency(idempotencyKey);
  if (existing) {
    logger.warn(
      `Duplicate transfer request blocked by idempotency key: ${idempotencyKey}`,
    );
    return existing;
  }

  const session = await mongoose.startSession();
  let transaction;

  try {
    await session.withTransaction(async () => {
      const fromAccount = await findActiveAccountOrThrow(
        fromAccountNumber,
        session,
      );
      const toAccount = await findActiveAccountOrThrow(
        toAccountNumber,
        session,
      );

      const [created] = await Transaction.create(
        [
          {
            reference: generateReference(),
            type: "TRANSFER",
            fromAccount: fromAccount._id,
            toAccount: toAccount._id,
            amount,
            status: "PENDING",
            idempotencyKey,
            initiatedBy,
          },
        ],
        { session },
      );
      transaction = created;

      const updatedFrom = await applyLedgerMovement({
        session,
        account: fromAccount,
        type: "DEBIT",
        amount,
        transactionId: transaction._id,
      });

      const updatedTo = await applyLedgerMovement({
        session,
        account: toAccount,
        type: "CREDIT",
        amount,
        transactionId: transaction._id,
      });

      transaction.status = "COMPLETED";
      await transaction.save({ session });

      // Stash for the email events emitted after the transaction commits.
      transaction._emailContext = {
        fromUser: fromAccount.user,
        toUser: toAccount.user,
        fromBalanceAfter: updatedFrom.balance,
        toBalanceAfter: updatedTo.balance,
        fromAccountNumber: fromAccount.accountNumber,
        toAccountNumber: toAccount.accountNumber,
      };
    });
  } catch (err) {
    if (transaction) {
      transaction.status = "FAILED";
      transaction.failureReason = err.message;
      await transaction.save().catch(() => {});
      transactionEvents.emit("email.notify", {
        type: "FAILED",
        userId: initiatedBy,
        amount,
        reference: transaction.reference,
        reason: err.message,
      });
    }
    throw err;
  } finally {
    await session.endSession();
  }

  // Fire-and-forget notification events; never block the API response on email.
  const ctx = transaction._emailContext;
  transactionEvents.emit("email.notify", {
    type: "DEBIT",
    userId: ctx.fromUser,
    amount,
    reference: transaction.reference,
    balanceAfter: ctx.fromBalanceAfter,
    accountNumber: ctx.fromAccountNumber,
  });
  transactionEvents.emit("email.notify", {
    type: "CREDIT",
    userId: ctx.toUser,
    amount,
    reference: transaction.reference,
    balanceAfter: ctx.toBalanceAfter,
    accountNumber: ctx.toAccountNumber,
  });

  return transaction;
};

const deposit = async ({
  accountNumber,
  amount,
  idempotencyKey,
  initiatedBy,
}) => {
  const existing = await checkIdempotency(idempotencyKey);
  if (existing) return existing;

  const session = await mongoose.startSession();
  let transaction;

  try {
    await session.withTransaction(async () => {
      const account = await findActiveAccountOrThrow(accountNumber, session);

      const [created] = await Transaction.create(
        [
          {
            reference: generateReference(),
            type: "DEPOSIT",
            toAccount: account._id,
            amount,
            status: "PENDING",
            idempotencyKey,
            initiatedBy,
          },
        ],
        { session },
      );
      transaction = created;

      const updated = await applyLedgerMovement({
        session,
        account,
        type: "CREDIT",
        amount,
        transactionId: transaction._id,
      });

      transaction.status = "COMPLETED";
      await transaction.save({ session });

      transaction._emailContext = {
        userId: account.user,
        balanceAfter: updated.balance,
        accountNumber: account.accountNumber,
      };
    });
  } catch (err) {
    if (transaction) {
      transaction.status = "FAILED";
      transaction.failureReason = err.message;
      await transaction.save().catch(() => {});
    }
    throw err;
  } finally {
    await session.endSession();
  }

  const ctx = transaction._emailContext;
  transactionEvents.emit("email.notify", {
    type: "CREDIT",
    userId: ctx.userId,
    amount,
    reference: transaction.reference,
    balanceAfter: ctx.balanceAfter,
    accountNumber: ctx.accountNumber,
  });

  return transaction;
};

const withdraw = async ({
  accountNumber,
  amount,
  idempotencyKey,
  initiatedBy,
}) => {
  const existing = await checkIdempotency(idempotencyKey);
  if (existing) return existing;

  const session = await mongoose.startSession();
  let transaction;

  try {
    await session.withTransaction(async () => {
      const account = await findActiveAccountOrThrow(accountNumber, session);

      const [created] = await Transaction.create(
        [
          {
            reference: generateReference(),
            type: "WITHDRAWAL",
            fromAccount: account._id,
            amount,
            status: "PENDING",
            idempotencyKey,
            initiatedBy,
          },
        ],
        { session },
      );
      transaction = created;

      const updated = await applyLedgerMovement({
        session,
        account,
        type: "DEBIT",
        amount,
        transactionId: transaction._id,
      });

      transaction.status = "COMPLETED";
      await transaction.save({ session });

      transaction._emailContext = {
        userId: account.user,
        balanceAfter: updated.balance,
        accountNumber: account.accountNumber,
      };
    });
  } catch (err) {
    if (transaction) {
      transaction.status = "FAILED";
      transaction.failureReason = err.message;
      await transaction.save().catch(() => {});
    }
    throw err;
  } finally {
    await session.endSession();
  }

  const ctx = transaction._emailContext;
  transactionEvents.emit("email.notify", {
    type: "DEBIT",
    userId: ctx.userId,
    amount,
    reference: transaction.reference,
    balanceAfter: ctx.balanceAfter,
    accountNumber: ctx.accountNumber,
  });

  return transaction;
};

const getHistoryForAccount = async (
  accountId,
  { page = 1, limit = 20 } = {},
) => {
  const skip = (page - 1) * limit;
  const filter = {
    $or: [{ fromAccount: accountId }, { toAccount: accountId }],
  };

  const [items, total] = await Promise.all([
    Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Transaction.countDocuments(filter),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const getByReference = async (reference) => {
  const transaction = await Transaction.findOne({ reference });
  if (!transaction) throw ApiError.notFound("Transaction not found");
  return transaction;
};

module.exports = {
  transfer,
  deposit,
  withdraw,
  getHistoryForAccount,
  getByReference,
};
