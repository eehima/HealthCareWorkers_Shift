import User from '../model/userModel.js';
import Worker from '../model/workersModel.js';
import Facility from '../model/facilityModel.js';
import Shift from '../model/shiftModel.js';
import Application from '../model/applicationModel.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    console.log(`adminController.getAllUsers called: ${req.method} ${req.originalUrl}`);
    const users = await User.find().select('-password -emailVerificationToken -passwordResetToken');
    res.status(200).json({
      status: 'success',
      total: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    console.log(`adminController.getUserById called: ${req.method} ${req.originalUrl}`);
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password -emailVerificationToken -passwordResetToken');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  try {
    console.log(`adminController.updateUserRole called: ${req.method} ${req.originalUrl}`);
    const { userId } = req.params;
    const { role } = req.body;

    if (!['worker', 'admin', 'facility'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be worker, admin, or facility' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken -passwordResetToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    console.log(`adminController.deleteUser called: ${req.method} ${req.originalUrl}`);
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Also delete associated worker profile if exists
    if (user.role === 'worker') {
      await Worker.deleteOne({ user: userId });
    }

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all workers
export const getAllWorkers = async (req, res) => {
  try {
    console.log(`adminController.getAllWorkers called: ${req.method} ${req.originalUrl}`);
    const workers = await Worker.find()
      .populate('user', '-password -emailVerificationToken -passwordResetToken');
    
    res.status(200).json({
      status: 'success',
      total: workers.length,
      data: workers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get worker by ID
export const getWorkerById = async (req, res) => {
  try {
    console.log(`adminController.getWorkerById called: ${req.method} ${req.originalUrl}`);
    const { workerId } = req.params;
    const worker = await Worker.findById(workerId)
      .populate('user', '-password -emailVerificationToken -passwordResetToken');
    
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    
    res.status(200).json({
      status: 'success',
      data: worker
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve worker verification
export const approveWorker = async (req, res) => {
  try {
    console.log(`adminController.approveWorker called: ${req.method} ${req.originalUrl}`);
    const { workerId } = req.params;
    const { notes } = req.body;

    // Try by worker _id first
    let worker = await Worker.findByIdAndUpdate(
      workerId,
      {
        verificationStatus: 'Approved',
        verificationNotes: notes || ''
      },
      { new: true, runValidators: true }
    ).populate('user', '-password -emailVerificationToken -passwordResetToken');

    // If not found, try treating workerId as a user id
    if (!worker) {
      console.log('approveWorker: not found by Worker._id, trying user id');
      worker = await Worker.findOneAndUpdate(
        { user: workerId },
        {
          verificationStatus: 'Approved',
          verificationNotes: notes || ''
        },
        { new: true, runValidators: true }
      ).populate('user', '-password -emailVerificationToken -passwordResetToken');
    }

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Worker approved successfully',
      data: worker
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject worker verification
export const rejectWorker = async (req, res) => {
  try {
    console.log(`adminController.rejectWorker called: ${req.method} ${req.originalUrl}`);
    const { workerId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    // Try by worker _id first
    let worker = await Worker.findByIdAndUpdate(
      workerId,
      {
        verificationStatus: 'Rejected',
        rejectionReason: reason
      },
      { new: true, runValidators: true }
    ).populate('user', '-password -emailVerificationToken -passwordResetToken');

    // If not found, try treating workerId as a user id
    if (!worker) {
      console.log('rejectWorker: not found by Worker._id, trying user id');
      worker = await Worker.findOneAndUpdate(
        { user: workerId },
        {
          verificationStatus: 'Rejected',
          rejectionReason: reason
        },
        { new: true, runValidators: true }
      ).populate('user', '-password -emailVerificationToken -passwordResetToken');
    }

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Worker rejected',
      data: worker
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all facilities
export const getAllFacilities = async (req, res) => {
  try {
    console.log(`adminController.getAllFacilities called: ${req.method} ${req.originalUrl}`);
    const facilities = await Facility.find()
      .populate('createdBy', '-password -emailVerificationToken -passwordResetToken')
      .populate('workers', '-password -emailVerificationToken -passwordResetToken');
    
    res.status(200).json({
      status: 'success',
      total: facilities.length,
      data: facilities
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get facility by ID
export const getFacilityById = async (req, res) => {
  try {
    console.log(`adminController.getFacilityById called: ${req.method} ${req.originalUrl}`);
    const { facilityId } = req.params;
    const facility = await Facility.findById(facilityId)
      .populate('createdBy', '-password -emailVerificationToken -passwordResetToken')
      .populate('workers', '-password -emailVerificationToken -passwordResetToken');
    
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    
    res.status(200).json({
      status: 'success',
      data: facility
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve facility
export const approveFacility = async (req, res) => {
  try {
    console.log(`adminController.approveFacility called: ${req.method} ${req.originalUrl}`);
    const { facilityId } = req.params;

    const facility = await Facility.findByIdAndUpdate(
      facilityId,
      { status: 'approved' },
      { new: true, runValidators: true }
    );

    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Facility approved successfully',
      data: facility
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject facility
export const rejectFacility = async (req, res) => {
  try {
    console.log(`adminController.rejectFacility called: ${req.method} ${req.originalUrl}`);
    const { facilityId } = req.params;

    const facility = await Facility.findByIdAndUpdate(
      facilityId,
      { status: 'rejected' },
      { new: true, runValidators: true }
    );

    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Facility rejected',
      data: facility
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all shifts
export const getAllShifts = async (req, res) => {
  try {
    console.log(`adminController.getAllShifts called: ${req.method} ${req.originalUrl}`);
    const shifts = await Shift.find()
      .populate('facility')
      .populate('assignedWorkers');
    
    res.status(200).json({
      status: 'success',
      total: shifts.length,
      data: shifts
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all applications
export const getAllApplications = async (req, res) => {
  try {
    console.log(`adminController.getAllApplications called: ${req.method} ${req.originalUrl}`);
    const applications = await Application.find()
      .populate('worker')
      .populate('shift');
    
    res.status(200).json({
      status: 'success',
      total: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    console.log(`adminController.getDashboardStats called: ${req.method} ${req.originalUrl}`);
    
    const totalUsers = await User.countDocuments();
    const totalWorkers = await Worker.countDocuments();
    const totalFacilities = await Facility.countDocuments();
    const pendingFacilities = await Facility.countDocuments({ status: 'pending' });
    const approvedFacilities = await Facility.countDocuments({ status: 'approved' });
    const rejectedFacilities = await Facility.countDocuments({ status: 'rejected' });
    const totalShifts = await Shift.countDocuments();
    const totalApplications = await Application.countDocuments();

    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        users: {
          total: totalUsers,
          byRole: usersByRole
        },
        workers: totalWorkers,
        facilities: {
          total: totalFacilities,
          pending: pendingFacilities,
          approved: approvedFacilities,
          rejected: rejectedFacilities
        },
        shifts: totalShifts,
        applications: totalApplications
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
