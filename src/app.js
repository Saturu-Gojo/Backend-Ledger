const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const accountRoutes = require("./routes/account.routes");
const transactionRoutes = require("./routes/transaction.routes");

const { generalLimiter } = require("./middlewares/rateLimiter.middleware");
const errorHandler = require("./middlewares/errorHandler.middleware");
const ApiError = require("./utils/ApiError");

const path = require("path");
const fs = require("fs");

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*",
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));
app.use(generalLimiter);

app.get("/health", (req, res) =>
  res.json({ status: "ok", uptime: process.uptime() }),
);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/accounts", accountRoutes);
app.use("/api/v1/transactions", transactionRoutes);

// Serve static frontend build if dist folder exists
const frontendDist = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get("*", (req, res, next) => {
    if (req.originalUrl.startsWith("/api")) return next();
    res.sendFile(path.join(frontendDist, "index.html"));
  });
} else {
  // Unknown route handler for API
  app.use((req, res, next) => {
    next(
      ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`),
    );
  });
}

// Must be last
app.use(errorHandler);

module.exports = app;
