import mongoose from 'mongoose';

const platformSettingSchema = new mongoose.Schema(
  {
    commissionPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 10,
    },
    currency: {
      type: String,
      default: 'NGN',
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

export default mongoose.model('PlatformSetting', platformSettingSchema);
