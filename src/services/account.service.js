const { v4: uuid } = require("uuid");
const Account = require("../models/Account");
const ApiError = require("../utils/ApiError");

const generateAccountNumber = () => {
  // e.g. ACC-7F3C9B1A2D
  return `ACC-${uuid().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
};

const createAccount = async (userId, { currency = "INR" } = {}) => {
  const account = await Account.create({
    user: userId,
    accountNumber: generateAccountNumber(),
    currency,
  });
  return account;
};

const getMyAccounts = async (userId) => {
  return Account.find({ user: userId }).sort({ createdAt: -1 });
};

const getAccountById = async (accountId, requestingUser) => {
  const account = await Account.findById(accountId);
  if (!account) throw ApiError.notFound("Account not found");

  if (
    requestingUser.role !== "admin" &&
    account.user.toString() !== requestingUser.id
  ) {
    throw ApiError.forbidden("You do not have access to this account");
  }
  return account;
};

const setAccountStatus = async (accountId, status) => {
  const account = await Account.findByIdAndUpdate(
    accountId,
    { status },
    { new: true },
  );
  if (!account) throw ApiError.notFound("Account not found");
  return account;
};

module.exports = {
  createAccount,
  getMyAccounts,
  getAccountById,
  setAccountStatus,
};
