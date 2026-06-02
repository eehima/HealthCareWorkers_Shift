import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Credit", "Debit", "Commission"],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  reference: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "transactions.referenceModel"
  },
  referenceModel: {
    type: String,
    enum: ["Shift", "User"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0
  },
  isPlatformSystemWallet: {
    type: Boolean,
    default: false
  },
  transactions: [transactionSchema]
}, {
  timestamps: true
});

export default mongoose.model("Wallet", walletSchema);