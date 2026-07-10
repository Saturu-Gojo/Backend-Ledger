const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ['TRANSFER', 'DEPOSIT', 'WITHDRAWAL'],
      required: true,
    },
    fromAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    toAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    amount: { type: Number, required: true, min: 0.01 },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'],
      default: 'PENDING',
    },
    // Prevents the same client-submitted request from being processed twice
    // (e.g. on network retry / double-click submit).
    idempotencyKey: { type: String, unique: true, sparse: true },
    failureReason: { type: String },
    initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

transactionSchema.index({ fromAccount: 1, createdAt: -1 });
transactionSchema.index({ toAccount: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
