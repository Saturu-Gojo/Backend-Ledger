const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return new ApiResponse(201, 'User registered successfully', result).send(res);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return new ApiResponse(200, 'Login successful', result).send(res);
});

const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.body.refreshToken);
  return new ApiResponse(200, 'Token refreshed', result).send(res);
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  return new ApiResponse(200, 'Logged out successfully').send(res);
});

module.exports = { register, login, refresh, logout };
