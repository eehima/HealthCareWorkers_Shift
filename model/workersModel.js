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
  profilePicture: {
    type: String,
    default: "https://res.cloudinary.com/dynjimrit/image/upload/v1701364415/default-profile-picture_oxh8lq.png"
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
    name: {type: String, required: true},
    documentUrl: {type: String, required: true},
    expiryDate: {type: Date}
    }
  ],

  verificationStatus: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  },

  verificationNotes: {
    type: String,
    trim: true
  },

  rejectionReason: {
    type: String,
    trim: true
  }

}, {
  timestamps: true
});

export default mongoose.model("Worker", workerSchema);