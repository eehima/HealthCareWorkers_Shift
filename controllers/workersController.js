import workersModel from "../model/workersModel.js";

// Get all workers
export const getAllWorkers = async (req, res) => {
    try {
        const workers = await workersModel.find();
        res.status(200).json(workers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
// get one workerer
export const getWorker = async (req, res) => {
    try {
        const profile = await workersModel.findOne({ user: req.user.id }).populate('user', 'email role isEmailVerified');
        if (!profile) {
            return res.status(404).json({ message: 'Worker profile not found' });
        }
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update worker profile
export const updateWorkerProfile = async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber, specialty, experienceYears, bio, verificationStatus, certificationName} = req.body;
        const updatedProfile = await workersModel.findOneAndUpdate(
            { user: req.user.id },
            { firstName, lastName, phoneNumber, specialty },
            { new: true, runValidators: true }
        );
        if (!updatedProfile) {
            return res.status(404).json({ message: 'Worker profile not found' });
        }
        res.status(200).json(updatedProfile);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
