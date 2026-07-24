const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { strictLimiter } = require("../middlewares/rateLimiter.middleware");
const {
  registerSchema,
  loginSchema,
  refreshSchema,
} = require("../validators/auth.validator");

const router = express.Router();

router.post(
  "/register",
  strictLimiter,
  validate(registerSchema),
  authController.register,
);
router.post(
  "/login",
  strictLimiter,
  validate(loginSchema),
  authController.login,
);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.post("/logout", authMiddleware, authController.logout);

module.exports = router;
