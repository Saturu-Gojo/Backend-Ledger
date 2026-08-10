const app = require("./app");
const env = require("./config/env");
const connectDB = require("./config/db");
const logger = require("./utils/logger");
// Side-effect import: wires the EventEmitter -> BullMQ bridge for emails & runs worker listener
require("./jobs/email.queue");
require("./jobs/email.worker");

const start = async () => {
  await connectDB();

  const server = app.listen(env.port, () => {
    logger.info(`API server running on port ${env.port} [${env.nodeEnv}]`);
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down gracefully`);
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

start().catch((err) => {
  logger.error(`Failed to start server: ${err.message}`);
  process.exit(1);
});
