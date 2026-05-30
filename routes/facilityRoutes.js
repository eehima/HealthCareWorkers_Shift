import express from "express";
import {
  createFacility,
  getAllFacility,
  getOneFacilityById,
  updateOneFacilityById,
  deleteOneFacilityById,
} from "../controllers/facilityController.js";
const router = express.Router();

router.post("/createFacility", createFacility);
router.get("/getAllFacility", getAllFacility);
router.get("/getOneFacilityById/:id", getOneFacilityById);
router.patch("/updateOneFacilityById/:id", updateOneFacilityById);
router.delete("/deleteOneFacilityById/:id", deleteOneFacilityById);

export default router;
