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
    // experience: {
    //     type: Number,
    //     required: true,
    //     min: 0
    // },
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
    availability: [
        {
            dayOfWeek: {
                type: String,
                enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                required: true
            },
            timeBlocks: [
                {
                    startTime: {
                        type: String,
                        required: true,
                        match: /^([0-1]\d|2[0-3]):([0-5]\d)$/ // HH:MM format
                    },
                    endTime: {
                        type: String,
                        required: true,
                        match: /^([0-1]\d|2[0-3]):([0-5]\d)$/ // HH:MM format
                    },
                    _id: false // Disable individual IDs for sub-documents
                }
            ]
        }
    ]
},{
    timestamps: true
});

export default mongoose.model("Worker", workerSchema);