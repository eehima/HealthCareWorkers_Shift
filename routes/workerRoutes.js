// Availability routes
import express from "express";
import * as authControllers from "../controllers/authControllers.js";
import * as workersController from "../controllers/workersController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Worker registration and email verification
router.post("/auth/register", authControllers.registerUser);
router.get("/auth/verify-email", authControllers.verifyEmail);
router.post("/auth/login", authControllers.loginUser);

// Protected routes
router.use(protect);
router.get("/profile", workersController.getWorker);
router.put("/profile", workersController.updateWorkerProfile);
router.get("/all-workers", workersController.getAllWorkers);

// Availability routes
router.post('/availability', workersController.addAvailability);
router.get('/availability', workersController.getAvailability);
router.put('/availability/:dayOfWeek', workersController.updateAvailability);
router.delete('/availability/:dayOfWeek', workersController.deleteAvailability);

export default router;
