import mongoose from "mongoose";

const workerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },

  firstName: {
    type: String,
    required: true,
    trim: true
  },

  lastName: {
    type: String,
    required: true,
    trim: true
  },

  phoneNumber: {
    type: String,
    required: true
  },

  specialty: {
    type: String,
    enum: ["nurse", "doctor", "therapist", "technician", "other"],
    required: true
  },

  experienceYears: {
    type: Number,
    default: 0
  },

  bio: {
    type: String,
    trim: true
  },

  address:{
    type:String
  },
  
  availability: [
    {
      dayOfWeek: { type: String },
      timeBlocks: [
        {
          start: { type: String },
          end: { type: String }
        }
      ]
    }
  ],
  
  certifications: [
    {
      documentName: String,
      documentUrl: String,
      expiryDate: Date
    }
  ],

  verificationStatus: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  }

}, {
  timestamps: true
});

export default mongoose.model("Worker", workerSchema);