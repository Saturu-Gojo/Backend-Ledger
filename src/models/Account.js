const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    accountNumber: { type: String, required: true, unique: true },
    balance: { type: Number, required: true, default: 0, min: 0 },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["ACTIVE", "FROZEN", "CLOSED"],
      default: "ACTIVE",
    },
    // Incremented on every balance mutation. Used for optimistic locking so
    // two concurrent transfers can never silently overwrite each other's update.
    version: { type: Number, default: 0 },
  },
  { timestamps: true },
);

accountSchema.index({ user: 1 });

module.exports = mongoose.model("Account", accountSchema);
