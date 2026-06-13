import mongoose from "mongoose";

const facilitySchema = new mongoose.Schema(
  {
    facilityName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phoneNumber: {
      type: String,
    },

    address: {
      type: String,
      required: true,
    },

    licenseNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    workers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    profilePicture: {
      type: String,
      default:
        "https://res.cloudinary.com/dynjimrit/image/upload/v1701364415/default-profile-picture_oxh8lq.png",
    },

    experienceYears: {
      type: Number,
      default: 0,
    },

    bio: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
    },

    availability: [
      {
        dayOfWeek: { type: String },
        timeBlocks: [
          {
            start: { type: String },
            end: { type: String },
          },
        ],
      },
    ],

    certifications: [
      {
        name: { type: String, required: true },
        documentUrl: { type: String, required: true },
        expiryDate: { type: Date },
      },
    ],

    verificationStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    verificationNotes: {
      type: String,
      trim: true,
    },

    rejectionReason: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Facility", facilitySchema);
