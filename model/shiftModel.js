import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },

    shiftDate: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
      trim: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    specialty: {
    type: String,
    trim: true,
    required: function () {
      return this.role === "worker";
    },
    validate: {
      validator: function (value) {
        if (this.role !== "worker") return true;
         return value && value.trim().length > 2;
      },
      message: "Specialty is required and must be at least 3 characters long for workers"
    },
    
  },

    workersNeeded: {
      type: Number,
      required: true,
      min: 1,
    },

    assignedWorkers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Worker",
      },
    ],

    applicants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Worker",
      },
    ],

    salary: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["open", "pending", "filled", "completed", "cancelled"],
      default: "open",
    },

    shiftType: {
      type: String,
      enum: ["morning", "afternoon", "night" , "day"],
      required: true,
    },

    urgent: {
      type: Boolean,
      default: false,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Shift", shiftSchema);
