import workersModel from "../model/workersModel.js";

// Get all workers
export const getAllWorkers = async (req, res) => {
    try {
        console.log("BODY RECEIVED:", req.body);
        console.log("USER:", req.user.id);
        const workers = await workersModel.find();

        res.status(200).json(workers);

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// Get single worker profile
export const getWorker = async (req, res) => {
    try {

        const profile = await workersModel
            .findOne({ user: req.user.id })
            .populate("user", "email role isEmailVerified");

        if (!profile) {
            return res.status(404).json({
                message: "Worker profile not found"
            });
        }

        res.status(200).json(profile);

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// Update worker profile
export const updateWorkerProfile = async (req, res) => {
    try {

        const {
            firstName,
            lastName,
            phoneNumber,
            specialty,
            experienceYears,
            bio,
            address,
            certifications
            
        } = req.body;

        const updatedProfile = await workersModel.findOneAndUpdate(
            { user: req.user.id },
            {
                firstName,
                lastName,
                phoneNumber,
                specialty,
                experienceYears,
                bio,
                address,
                certifications
                
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedProfile) {
            return res.status(404).json({
                message: "Worker profile not found"
            });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            data: updatedProfile
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};