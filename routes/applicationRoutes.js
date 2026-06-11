import express from "express";

import {
  applyForShift,
  getAllApplications,
  reviewApplication,
  assignShift,
  withdrawApplication,
} from "../controllers/applicationController.js";

const router = express.Router();
router.post("/applyForShift/:shiftId", applyForShift);
router.get("/getAllApplications", getAllApplications);
router.patch("/reviewApplication/:id", reviewApplication);
router.patch("/assignShift/:shiftId", assignShift);
router.patch("/withdrawApplication/:applicationId", withdrawApplication);

export default router;
