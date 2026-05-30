import express from "express";
import {
  createShift,
  getAllShifts,
  getOneShiftById,
  updateShiftById,
  deleteShiftById,
} from "../controllers/shiftController.js";

const router = express.Router();
router.post("/createShift", createShift);
router.get("/getAllShifts", getAllShifts);
router.get("/getOneShiftById/:id", getOneShiftById);
router.patch("/updateShiftById/:id", updateShiftById);
router.delete("/deleteShiftById/:id", deleteShiftById);

export default router;
