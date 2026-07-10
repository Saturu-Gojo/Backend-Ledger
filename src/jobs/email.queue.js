const { Queue } = require('bullmq');
const connection = require('../config/redis');
const transactionEvents = require('../events/transaction.events');
const logger = require('../utils/logger');

const emailQueue = new Queue('email-notifications', { connection });

// Bridges the in-process event emitter to a durable, retryable Redis-backed job.
// If the process restarts before the email worker runs, the job is still in Redis.
transactionEvents.on('email.notify', async (payload) => {
  try {
    await emailQueue.add('sendTransactionEmail', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: { age: 3600, count: 1000 },
      removeOnFail: { age: 86400 },
    });
  } catch (err) {
    // Queueing itself should never crash the request/transaction flow.
    logger.error(`Failed to enqueue email job: ${err.message}`);
  }
});

module.exports = emailQueue;
