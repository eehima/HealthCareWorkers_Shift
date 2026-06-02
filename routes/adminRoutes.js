import express from "express";
import { updateUserStatus, processShiftPayout } from "../controllers/adminController.js";

const router = express.Router();

// PATCH /api/admin/users/:id/status
// Admin approves or rejects a worker or facility
router.patch("/users/:id/status", updateUserStatus);

// POST /api/admin/payout/:shiftId
// Process automated payout after shift completion
router.post("/payout/:shiftId", processShiftPayout);

export default router;