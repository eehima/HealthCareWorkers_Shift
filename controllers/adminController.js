import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../model/userModel.js';
import Worker from '../model/workersModel.js';
import Facility from '../model/facilityModel.js';
import Shift from '../model/shiftModel.js';
import Application from '../model/applicationModel.js';
import PaymentTransaction from '../model/paymentTransactionModel.js';
import PlatformSetting from '../model/platformSettingModel.js';
import EscrowWallet from '../model/escrowWalletModel.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    console.log(`adminController.getAllUsers called: ${req.method} ${req.originalUrl}`);
    const users = await User.find().select('-password');
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
    const user = await User.findById(userId).select('-password');
    
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
    ).select('-password');

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
      .populate('user', '-password');
    
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
      .populate('user', '-password');
    
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
    ).populate('user', '-password');

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
      ).populate('user', '-password');
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
    ).populate('user', '-password');

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
      ).populate('user', '-password');
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
      .populate('createdBy', '-password')
      .populate('workers', '-password');
    
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
      .populate('createdBy', '-password')
      .populate('workers', '-password');
    
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
      .populate('facilityId')
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
      .populate('workerId')
      .populate('shiftId');
    
    res.status(200).json({
      status: 'success',
      total: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a mock payment or escrow transaction
export const createMockPayment = async (req, res) => {
  try {
    console.log(`adminController.createMockPayment called: ${req.method} ${req.originalUrl}`);
    const {
      transactionType,
      amount,
      currency,
      payer,
      payee,
      relatedShift,
      relatedFacility,
      adminNotes,
      details,
    } = req.body;

    if (!['payment', 'escrow'].includes(transactionType)) {
      return res.status(400).json({ message: 'Invalid transaction type. Must be payment or escrow.' });
    }

    if (typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({ message: 'Amount must be a non-negative number.' });
    }

    const validObjectId = (value) => !value || mongoose.Types.ObjectId.isValid(value);

    if (!validObjectId(payer) || !validObjectId(payee) || !validObjectId(relatedShift) || !validObjectId(relatedFacility)) {
      return res.status(400).json({ message: 'One or more provided IDs are invalid.' });
    }

    const transactionReference = `MOCK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // determine commission percent (admin-configurable)
    const setting = await PlatformSetting.findOne();
    const commissionPercent = setting && typeof setting.commissionPercent === 'number'
      ? setting.commissionPercent
      : (process.env.PLATFORM_COMMISSION_PERCENT ? parseFloat(process.env.PLATFORM_COMMISSION_PERCENT) : 10);

    const platformFee = Math.round((amount * (commissionPercent / 100)) * 100) / 100; // 2 decimals
    const netAmount = Math.round((amount - platformFee) * 100) / 100;

    const walletCurrency = currency || (setting && setting.currency) || 'NGN';
    const escrowWallet = await EscrowWallet.findOneAndUpdate(
      {},
      {
        $inc: {
          heldBalance: netAmount,
          commissionBalance: platformFee,
        },
        $set: {
          currency: walletCurrency,
          updatedBy: req.user.id,
        },
      },
      { new: true, upsert: true }
    );

    const payment = await PaymentTransaction.create({
      transactionReference,
      transactionType,
      amount,
      currency: walletCurrency,
      payer,
      payee,
      relatedShift,
      relatedFacility,
      status: 'escrowed',
      gateway: 'mock',
      adminNotes,
      details,
      appliedCommissionPercent: commissionPercent,
      platformFee,
      netAmount,
      escrowedAt: Date.now(),
      createdBy: req.user.id,
    });

    res.status(201).json({
      status: 'success',
      message: 'Mock payment transaction created and held in escrow successfully',
      transaction: payment,
      escrowWallet,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all mock payment or escrow transactions
export const getAllMockPayments = async (req, res) => {
  try {
    console.log(`adminController.getAllMockPayments called: ${req.method} ${req.originalUrl}`);
    const { transactionType, status } = req.query;
    const filter = {};

    if (transactionType) {
      if (!['payment', 'escrow'].includes(transactionType)) {
        return res.status(400).json({ message: 'Invalid transactionType query. Use payment or escrow.' });
      }
      filter.transactionType = transactionType;
    }

    if (status) {
      filter.status = status;
    }

    const transactions = await PaymentTransaction.find(filter)
      .populate('payer', '-password')
      .populate('payee', '-password')
      .populate('relatedShift')
      .populate('relatedFacility')
      .populate('createdBy', '-password');

    res.status(200).json({
      status: 'success',
      total: transactions.length,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get escrow wallet status
export const getEscrowWallet = async (req, res) => {
  try {
    console.log(`adminController.getEscrowWallet called: ${req.method} ${req.originalUrl}`);
    let wallet = await EscrowWallet.findOne();
    if (!wallet) {
      wallet = await EscrowWallet.create({ updatedBy: req.user.id });
    }

    res.status(200).json({
      status: 'success',
      data: wallet,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Settle a mock payment transaction and release net amount from escrow
export const settleMockPayment = async (req, res) => {
  try {
    console.log(`adminController.settleMockPayment called: ${req.method} ${req.originalUrl}`);
    const { paymentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: 'Invalid payment ID.' });
    }

    const transaction = await PaymentTransaction.findById(paymentId);
    if (!transaction) {
      return res.status(404).json({ message: 'Mock payment transaction not found' });
    }

    if (transaction.status === 'released') {
      return res.status(400).json({ message: 'Transaction is already settled.' });
    }
    if (transaction.status === 'cancelled' || transaction.status === 'refunded') {
      return res.status(400).json({ message: 'Cannot settle a cancelled or refunded transaction.' });
    }

    transaction.status = 'released';
    transaction.releasedAt = Date.now();
    transaction.settledBy = req.user.id;
    await transaction.save();

    const wallet = await EscrowWallet.findOneAndUpdate(
      {},
      {
        $inc: {
          heldBalance: -transaction.netAmount,
          releasedBalance: transaction.netAmount,
        },
        $set: {
          updatedBy: req.user.id,
        },
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Transaction settled and net amount released from escrow.',
      transaction,
      escrowWallet: wallet,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get one mock payment transaction by ID
export const getMockPaymentById = async (req, res) => {
  try {
    console.log(`adminController.getMockPaymentById called: ${req.method} ${req.originalUrl}`);
    const { paymentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: 'Invalid payment ID.' });
    }

    const transaction = await PaymentTransaction.findById(paymentId)
      .populate('payer', '-password')
      .populate('payee', '-password')
      .populate('relatedShift')
      .populate('relatedFacility')
      .populate('createdBy', '-password');

    if (!transaction) {
      return res.status(404).json({ message: 'Mock payment transaction not found' });
    }

    res.status(200).json({
      status: 'success',
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update mock payment transaction status
export const updateMockPaymentStatus = async (req, res) => {
  try {
    console.log(`adminController.updateMockPaymentStatus called: ${req.method} ${req.originalUrl}`);
    const { paymentId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: 'Invalid payment ID.' });
    }

    const transaction = await PaymentTransaction.findById(paymentId);
    if (!transaction) {
      return res.status(404).json({ message: 'Mock payment transaction not found' });
    }

    const validStatuses = {
      payment: ['pending', 'processing', 'completed', 'refunded', 'cancelled'],
      escrow: ['pending', 'escrowed', 'released', 'refunded', 'cancelled'],
    };

    if (!status || !validStatuses[transaction.transactionType].includes(status)) {
      return res.status(400).json({
        message: `Invalid status for ${transaction.transactionType}. Valid values: ${validStatuses[transaction.transactionType].join(', ')}`,
      });
    }

    transaction.status = status;
    await transaction.save();

    res.status(200).json({
      status: 'success',
      message: 'Mock payment transaction status updated successfully',
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel a mock payment transaction
export const cancelMockPayment = async (req, res) => {
  try {
    console.log(`adminController.cancelMockPayment called: ${req.method} ${req.originalUrl}`);
    const { paymentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: 'Invalid payment ID.' });
    }

    const transaction = await PaymentTransaction.findById(paymentId);
    if (!transaction) {
      return res.status(404).json({ message: 'Mock payment transaction not found' });
    }

    transaction.status = 'cancelled';
    await transaction.save();

    res.status(200).json({
      status: 'success',
      message: 'Mock payment transaction cancelled successfully',
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get platform settings (admin)
export const getPlatformSettings = async (req, res) => {
  try {
    console.log(`adminController.getPlatformSettings called: ${req.method} ${req.originalUrl}`);
    let setting = await PlatformSetting.findOne();
    if (!setting) {
      // create default if missing
      setting = await PlatformSetting.create({ updatedBy: req.user.id });
    }
    res.status(200).json({ status: 'success', data: setting });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update platform settings (admin)
export const updatePlatformSettings = async (req, res) => {
  try {
    console.log(`adminController.updatePlatformSettings called: ${req.method} ${req.originalUrl}`);
    const { commissionPercent, currency } = req.body;

    const update = {};
    if (typeof commissionPercent !== 'undefined') update.commissionPercent = commissionPercent;
    if (typeof currency !== 'undefined') update.currency = currency;
    update.updatedBy = req.user.id;

    let setting = await PlatformSetting.findOneAndUpdate({}, update, { new: true, upsert: true, runValidators: true });

    res.status(200).json({ status: 'success', message: 'Platform settings updated', data: setting });
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

    const wallet = await EscrowWallet.findOne();

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
        applications: totalApplications,
        escrowWallet: wallet
          ? {
              currency: wallet.currency,
              heldBalance: wallet.heldBalance,
              releasedBalance: wallet.releasedBalance,
              commissionBalance: wallet.commissionBalance,
            }
          : {
              currency: 'NGN',
              heldBalance: 0,
              releasedBalance: 0,
              commissionBalance: 0,
            }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
