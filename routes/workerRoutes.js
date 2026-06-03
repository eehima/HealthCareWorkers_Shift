// Availability routes
import express from "express";
import * as workersController from "../controllers/workersController.js";
import { protect} from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected worker routes
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
