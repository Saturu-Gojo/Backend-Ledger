const EventEmitter = require('events');

// Decouples transaction.service.js from the email/notification pipeline.
// transaction.service.js only ever calls .emit() — it has no idea BullMQ exists.
class TransactionEventEmitter extends EventEmitter {}

const transactionEvents = new TransactionEventEmitter();

module.exports = transactionEvents;
