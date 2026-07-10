const jwt = require('jsonwebtoken');
const env = require('../config/env');

const signAccessToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiry,
  });

const signRefreshToken = (user) =>
  jwt.sign({ sub: user._id.toString() }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiry,
  });

const verifyRefreshToken = (token) => jwt.verify(token, env.jwt.refreshSecret);

module.exports = { signAccessToken, signRefreshToken, verifyRefreshToken };
