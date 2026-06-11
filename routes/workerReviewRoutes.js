import express from "express";

import {
  reviewWorker,
  getWorkerReviews,
} from "../controllers/workerReviewController.js";

const router = express.Router();
router.post("/reviewWorker/:workerId/:shiftId", reviewWorker);
router.get("/getWorkerReviews/:workerId", getWorkerReviews);

export default router;
