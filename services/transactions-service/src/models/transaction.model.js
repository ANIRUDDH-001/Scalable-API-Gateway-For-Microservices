const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    accountId: {
      type: String,
      required: [true, 'accountId is required'],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: ['credit', 'debit', 'transfer'],
        message: 'type must be credit, debit, or transfer',
      },
      required: [true, 'type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'amount is required'],
      min: [0.01, 'amount must be greater than 0'],
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      length: 3,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [255, 'description cannot exceed 255 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
    referenceId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

transactionSchema.index({ accountId: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
