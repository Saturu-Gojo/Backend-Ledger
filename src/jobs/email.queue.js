const { Queue } = require("bullmq");
const connection = require("../config/redis");
const transactionEvents = require("../events/transaction.events");
const logger = require("../utils/logger");
const { processEmailNotification } = require("./email.worker");

const emailQueue = new Queue("email-notifications", { connection });

// Bridges the in-process event emitter to a durable, retryable Redis-backed job.
// If Redis is offline, falls back to direct async background sending.
transactionEvents.on("email.notify", async (payload) => {
  try {
    await emailQueue.add("sendTransactionEmail", payload, {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: { age: 3600, count: 1000 },
      removeOnFail: { age: 86400 },
    });
  } catch (err) {
    logger.warn(`Redis queue notice: ${err.message}. Falling back to direct email delivery...`);
    processEmailNotification(payload).catch((fallbackErr) => {
      logger.error(`Direct email fallback failed: ${fallbackErr.message}`);
    });
  }
});

module.exports = emailQueue;
