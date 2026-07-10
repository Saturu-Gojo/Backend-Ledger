const env = require('../config/env');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

// Must be registered LAST in app.js, after all routes.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let { statusCode, message, details } = err;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => e.message);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0];
    message = `Duplicate value for field: ${field}`;
  }

  // Mongoose invalid ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field: ${err.path}`;
  }

  if (!statusCode) {
    statusCode = 500;
    message = message || 'Internal server error';
  }

  if (statusCode === 500 || !(err instanceof ApiError)) {
    logger.error(err.stack || err.message);
  } else {
    logger.warn(`${statusCode} - ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details: details || undefined,
    stack: env.nodeEnv === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;
