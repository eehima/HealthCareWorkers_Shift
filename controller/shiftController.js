import Shift from '../model/shiftModel.js';
import Worker from '../model/workersModel.js';

// POST /api/worker/shifts/:id/apply
export const applyForShift = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user.id });

    if (worker.verificationStatus !== 'Approved') {
      return res.status(403).json({ 
        message: 'You must be verified before you can apply for shifts.' 
      });
    }

    const shift = await Shift.findById(req.params.id);

    if (!shift) {
      return res.status(404).json({ message: 'Shift not found.' });
    }

    if (shift.status !== 'Open') {
      return res.status(400).json({ message: 'This shift is no longer available.' });
    }

    if (shift.applicants.includes(req.user.id)) {
      return res.status(400).json({ message: 'You have already applied for this shift.' });
    }

    shift.applicants.push(req.user.id);
    await shift.save();

    res.status(200).json({ message: 'Application submitted successfully.' });

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

export const discoverShifts = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user.id });

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found.' });
    }

    if (worker.verificationStatus !== 'Approved') {
      return res.status(403).json({
        message: 'You must be verified before you can browse shifts.'
      });
    }

    const shifts = await Shift.find({
      status: 'Open',
      requiredSpecialty: worker.specialty
    });

    res.status(200).json({
      message: 'Shifts fetched successfully',
      shifts: shifts
    });

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};