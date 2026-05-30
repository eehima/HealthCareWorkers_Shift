import applicationModel from "../model/applicationModel.js";
import shiftModel from "../model/shiftModel.js";

// APPLY FOR SHIFT
export const applyForShift = async (req, res) => {
  try {
    const { workerId, facilityId, coverMessage } = req.body;

    const application = await applicationModel.create({
      workerId,
      facilityId,
      shiftId: req.params.shiftId,
      coverMessage,
    });

    return res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error applying for shift",
      error: error.message,
    });
  }
};

// GET ALL APPLICATIONS
export const getAllApplications = async (req, res) => {
  try {
    const applications = await applicationModel
      .find()
      .populate("workerId")
      .populate("shiftId")
      .populate("facilityId");

    return res.status(200).json({
      message: "Applications fetched successfully",
      applications,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching applications",
      error: error.message,
    });
  }
};

// REVIEW APPLICATION
export const reviewApplication = async (req, res) => {
  try {
    const { status, rejectionReason, reviewedBy } = req.body;

    const updatedApplication = await applicationModel.findByIdAndUpdate(
      req.params.id,
      {
        status,
        rejectionReason,
        reviewedBy,
        reviewedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedApplication) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    return res.status(200).json({
      message: "Application reviewed successfully",
      updatedApplication,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error reviewing application",
      error: error.message,
    });
  }
};

// ASSIGN SHIFT
export const assignShift = async (req, res) => {
  try {
    const { workerId } = req.body;

    const shift = await shiftModel.findById(req.params.shiftId);

    if (!shift) {
      return res.status(404).json({
        message: "Shift not found",
      });
    }

    shift.assignedWorkers.push(workerId);

    shift.status = "filled";

    await shift.save();

    return res.status(200).json({
      message: "Shift assigned successfully",
      shift,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error assigning shift",
      error: error.message,
    });
  }
};
