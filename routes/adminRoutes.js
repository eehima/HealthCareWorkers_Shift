import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
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
  getDashboardStats
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

// Facility management
router.get('/facilities', getAllFacilities);
router.get('/facilities/:facilityId', getFacilityById);
router.patch('/facilities/:facilityId/approve', approveFacility);
router.patch('/facilities/:facilityId/reject', rejectFacility);

// Shifts and Applications
router.get('/shifts', getAllShifts);
router.get('/applications', getAllApplications);

export default router;
