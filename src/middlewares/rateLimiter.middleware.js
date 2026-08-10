const rateLimit = require("express-rate-limit");
const env = require("../config/env");

// General-purpose limiter applied app-wide
const generalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

// Stricter limiter for auth + money-movement endpoints, to slow brute force
// login attempts and rapid-fire transfer abuse.
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:
    parseInt(process.env.RATE_LIMIT_STRICT_MAX, 10) ||
    (env.nodeEnv === "development" ? 500 : 15),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please slow down." },
});

module.exports = { generalLimiter, strictLimiter };
