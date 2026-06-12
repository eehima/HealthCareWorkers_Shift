import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  getWorkerVerificationQueue,
  getFacilityVerificationQueue,
  deleteUser,
  getAllWorkers,
  getWorkerById,
  approveWorker,
  rejectWorker,
  getAllFacilities,
  getFacilityById,
  approveFacility,
  rejectFacility,
  getAllShifts,
  getAllApplications,
  getDashboardStats,
  createMockPayment,
  getAllMockPayments,
  getMockPaymentById,
  updateMockPaymentStatus,
  cancelMockPayment,
  getEscrowWallet,
  settleMockPayment,
  getPlatformSettings,
  updatePlatformSettings
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.patch('/users/:userId/role', updateUserRole);
router.delete('/users/:userId', deleteUser);

// Worker management
router.get('/workers', getAllWorkers);
router.get('/workers/:workerId', getWorkerById);
router.patch('/workers/:workerId/approve', approveWorker);
router.patch('/workers/:workerId/reject', rejectWorker);
router.get('/workers/verification-queue', getWorkerVerificationQueue);

// Facility management
router.get('/facilities', getAllFacilities);
router.get('/facilities/:facilityId', getFacilityById);
router.patch('/facilities/:facilityId/approve', approveFacility);
router.patch('/facilities/:facilityId/reject', rejectFacility);
router.get('/facilities/verification-queue', getFacilityVerificationQueue);

// Shifts and Applications
router.get('/shifts', getAllShifts);
router.get('/applications', getAllApplications);
router.get('/payments', getAllMockPayments);
router.get('/payments/:paymentId', getMockPaymentById);
router.post('/payments', createMockPayment);
router.patch('/payments/:paymentId/status', updateMockPaymentStatus);
router.post('/payments/:paymentId/settle', settleMockPayment);
router.delete('/payments/:paymentId', cancelMockPayment);
router.get('/escrow/wallet', getEscrowWallet);
// Platform settings
router.get('/platform/settings', getPlatformSettings);
router.patch('/platform/settings', updatePlatformSettings);

export default router;
