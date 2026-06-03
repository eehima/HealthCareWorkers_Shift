import mongoose from 'mongoose';

const paymentTransactionSchema = new mongoose.Schema(
  {
    transactionReference: {
      type: String,
      required: true,
      unique: true,
    },
    transactionType: {
      type: String,
      enum: ['payment', 'escrow'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'NGN',
    },
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    payee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    relatedShift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shift',
    },
    relatedFacility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'escrowed', 'released', 'cancelled', 'refunded'],
      default: 'pending',
    },
    gateway: {
      type: String,
      default: 'mock',
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    details: {
      type: String,
      trim: true,
    },
    // Commission and settlement fields
    appliedCommissionPercent: {
      type: Number,
      default: 0,
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    netAmount: {
      type: Number,
      default: 0,
    },
    escrowedAt: {
      type: Date,
    },
    releasedAt: {
      type: Date,
    },
    settledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('PaymentTransaction', paymentTransactionSchema);
