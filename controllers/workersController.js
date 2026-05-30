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
        const allowedFields = [
            'firstName',
            'lastName',
            'phoneNumber',
            'specialty',
            'experienceYears',
            'bio',
            'address',
            'certifications'
        ];

        const updates = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: 'No valid fields provided to update. Please send one of: ' + allowedFields.join(', ')
            });
        }

        const updatedProfile = await workersModel.findOneAndUpdate(
            { user: req.user.id },
            updates,
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

// Add availability for a day
export const addAvailability = async (req, res) => {
    try {
        const { dayOfWeek, timeBlocks } = req.body;
        
        // Validate input
        if (!dayOfWeek || !timeBlocks || !Array.isArray(timeBlocks)) {
            return res.status(400).json({ message: 'dayOfWeek and timeBlocks array required' });
        }

        const worker = await workersModel.findOne({ user: req.user.id });

        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        const existingIndex = worker.availability.findIndex(item => item.dayOfWeek === dayOfWeek);

        if (existingIndex >= 0) {
            worker.availability[existingIndex].timeBlocks = timeBlocks;
        } else {
            worker.availability.push({ dayOfWeek, timeBlocks });
        }

        await worker.save();

        res.status(201).json(worker);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update availability for a specific day
export const updateAvailability = async (req, res) => {
    try {
        const dayOfWeek = req.params.dayOfWeek || req.body.dayOfWeek;
        const { timeBlocks } = req.body;

        if (!dayOfWeek) {
            return res.status(400).json({ message: 'dayOfWeek is required in the URL or request body.' });
        }

        if (!timeBlocks) {
            return res.status(400).json({ message: 'timeBlocks is required in the request body.' });
        }

        if (!Array.isArray(timeBlocks)) {
            return res.status(400).json({ message: 'timeBlocks must be an array.' });
        }

        const worker = await workersModel.findOne({ user: req.user.id });

        if (!worker) {
            return res.status(404).json({ message: 'Worker not found.' });
        }

        const availabilityIndex = worker.availability.findIndex(item => item.dayOfWeek === dayOfWeek);

        if (availabilityIndex === -1) {
            return res.status(404).json({ message: `No availability record found for dayOfWeek '${dayOfWeek}'. Use POST /availability first.` });
        }

        worker.availability[availabilityIndex].timeBlocks = timeBlocks;
        await worker.save();

        res.status(200).json(worker);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get worker availability
export const getAvailability = async (req, res) => {
    try {
        const worker = await workersModel.findOne({ user: req.user.id }).select('availability');

        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        res.status(200).json(worker.availability);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete availability for a specific day
export const deleteAvailability = async (req, res) => {
    try {
        const { dayOfWeek } = req.params;

        const worker = await workersModel.findOneAndUpdate(
            { user: req.user.id },
            { $pull: { availability: { dayOfWeek } } },
            { new: true }
        );

        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        res.status(200).json(worker);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
