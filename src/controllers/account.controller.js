const accountService = require("../services/account.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const createAccount = asyncHandler(async (req, res) => {
  const account = await accountService.createAccount(req.user.id, req.body);
  return new ApiResponse(201, "Account created successfully", account).send(
    res,
  );
});

const getMyAccounts = asyncHandler(async (req, res) => {
  const accounts = await accountService.getMyAccounts(req.user.id);
  return new ApiResponse(200, "Accounts fetched successfully", accounts).send(
    res,
  );
});

const getAccountById = asyncHandler(async (req, res) => {
  const account = await accountService.getAccountById(req.params.id, req.user);
  return new ApiResponse(200, "Account fetched successfully", account).send(
    res,
  );
});

const freezeAccount = asyncHandler(async (req, res) => {
  const account = await accountService.setAccountStatus(
    req.params.id,
    "FROZEN",
  );
  return new ApiResponse(200, "Account frozen", account).send(res);
});

const unfreezeAccount = asyncHandler(async (req, res) => {
  const account = await accountService.setAccountStatus(
    req.params.id,
    "ACTIVE",
  );
  return new ApiResponse(200, "Account reactivated", account).send(res);
});

const getAllAccounts = asyncHandler(async (req, res) => {
  const accounts = await accountService.getAllAccounts();
  return new ApiResponse(
    200,
    "All accounts fetched successfully",
    accounts,
  ).send(res);
});

module.exports = {
  createAccount,
  getMyAccounts,
  getAccountById,
  freezeAccount,
  unfreezeAccount,
  getAllAccounts,
};
