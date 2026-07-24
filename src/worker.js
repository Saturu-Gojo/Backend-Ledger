const connectDB = require("./config/db");
const logger = require("./utils/logger");
require("./jobs/email.worker"); // starts the BullMQ Worker on import

const start = async () => {
  // The worker needs DB access to resolve user emails and account numbers.
  await connectDB();
  logger.info("Email worker process started and listening for jobs");
};

start().catch((err) => {
  logger.error(`Failed to start worker: ${err.message}`);
  process.exit(1);
});

process.on("SIGINT", () => {
  logger.info("Worker shutting down");
  process.exit(0);
});
