import mongoose from 'mongoose';

const escrowWalletSchema = new mongoose.Schema(
  {
    currency: {
      type: String,
      default: 'NGN',
    },
    heldBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    releasedBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    commissionBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('EscrowWallet', escrowWalletSchema);
