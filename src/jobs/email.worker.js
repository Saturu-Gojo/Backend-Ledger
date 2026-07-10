const { Worker } = require('bullmq');
const connection = require('../config/redis');
const logger = require('../utils/logger');
const User = require('../models/User');
const Account = require('../models/Account');
const emailService = require('../services/email.service');

const worker = new Worker(
  'email-notifications',
  async (job) => {
    const { type, userId, amount, currency, reference, balanceAfter, accountNumber, reason } =
      job.data;

    // Resolve the recipient's current email at send-time, not at enqueue-time,
    // so the email always reflects up-to-date contact info.
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User ${userId} not found - cannot send ${type} email`);
    }

    let resolvedAccountNumber = accountNumber;
    if (!resolvedAccountNumber) {
      const account = await Account.findOne({ user: userId });
      resolvedAccountNumber = account ? account.accountNumber : 'N/A';
    }

    await emailService.sendTransactionEmail({
      type,
      to: user.email,
      name: user.name,
      amount,
      currency: currency || 'INR',
      reference,
      balanceAfter,
      accountNumber: resolvedAccountNumber,
      reason,
    });
  },
  { connection, concurrency: 5 }
);

worker.on('completed', (job) => {
  logger.info(`Email job ${job.id} completed (${job.data.type})`);
});

worker.on('failed', (job, err) => {
  logger.error(`Email job ${job?.id} failed after retries: ${err.message}`);
});

module.exports = worker;
