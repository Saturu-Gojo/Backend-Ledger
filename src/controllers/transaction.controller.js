const transactionService = require("../services/transaction.service");
const accountService = require("../services/account.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const transfer = asyncHandler(async (req, res) => {
  const idempotencyKey =
    req.headers["idempotency-key"] || req.body.idempotencyKey;
  const transaction = await transactionService.transfer({
    ...req.body,
    idempotencyKey,
    initiatedBy: req.user.id,
  });
  return new ApiResponse(201, "Transfer processed", transaction).send(res);
});

const deposit = asyncHandler(async (req, res) => {
  const idempotencyKey =
    req.headers["idempotency-key"] || req.body.idempotencyKey;
  const transaction = await transactionService.deposit({
    ...req.body,
    idempotencyKey,
    initiatedBy: req.user.id,
  });
  return new ApiResponse(201, "Deposit processed", transaction).send(res);
});

const withdraw = asyncHandler(async (req, res) => {
  const idempotencyKey =
    req.headers["idempotency-key"] || req.body.idempotencyKey;
  const transaction = await transactionService.withdraw({
    ...req.body,
    idempotencyKey,
    initiatedBy: req.user.id,
  });
  return new ApiResponse(201, "Withdrawal processed", transaction).send(res);
});

const getHistory = asyncHandler(async (req, res) => {
  const account = await accountService.getAccountById(
    req.params.accountId,
    req.user,
  );
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const result = await transactionService.getHistoryForAccount(account._id, {
    page,
    limit,
  });
  return new ApiResponse(200, "Transaction history fetched", result).send(res);
});

const getByReference = asyncHandler(async (req, res) => {
  const transaction = await transactionService.getByReference(
    req.params.reference,
  );
  return new ApiResponse(200, "Transaction fetched", transaction).send(res);
});

module.exports = { transfer, deposit, withdraw, getHistory, getByReference };
