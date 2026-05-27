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
        required: true,
    },
    specialty: {
        type: String,
        enum: ["nurse", "doctor", "therapist", "technician", "other"],
        required: true
    },
    credentials: {
        type: String,
        documentName: String,
        documentUrl: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
},{
    timestamps: true
});

export default mongoose.model("Worker", workerSchema);