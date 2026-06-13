import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  createFacility,
  getAllFacility,
  getOneFacilityById,
  updateOneFacilityById,
  deleteOneFacilityById,
  uploadProfilePicture,
  updateCertifications
} from "../controllers/facilityController.js";
const router = express.Router();

// Facility CRUD routes
router.post("/", protect, authorize("facility"), createFacility);
router.get("/", getAllFacility);
router.get("/:id", getOneFacilityById);
router.patch("/:id", updateOneFacilityById);
router.delete("/:id", deleteOneFacilityById);
router.patch("/upload-profile-picture", uploadProfilePicture);
router.patch("/update-certifications", updateCertifications);

export default router;
