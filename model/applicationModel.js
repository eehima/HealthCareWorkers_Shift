import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
    },

    shiftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      required: true,
    },

    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "assigned", "withdrawn"],
      default: "pending",
    },

    coverMessage: {
      type: String,
      trim: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
    },

    reviewedAt: {
      type: Date,
    },

    rejectionReason: {
      type: String,
      trim: true,
    },

    assignedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Application", applicationSchema);
