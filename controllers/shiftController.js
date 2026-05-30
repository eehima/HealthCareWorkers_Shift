import shiftModel from "../model/shiftModel.js";

// CREATE SHIFT
export const createShift = async (req, res) => {
  try {
    const newShift = await shiftModel.create(req.body);

    return res.status(201).json({
      message: "Shift created successfully",
      newShift,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating shift",
      error: error.message,
    });
  }
};

// GET ALL SHIFTS
export const getAllShifts = async (req, res) => {
  try {
    const shifts = await shiftModel.find();

    return res.status(200).json({
      message: "All shifts fetched successfully",
      shifts,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching shifts",
      error: error.message,
    });
  }
};

// GET ONE SHIFT
export const getOneShiftById = async (req, res) => {
  try {
    const shift = await shiftModel.findById(req.params.id);

    if (!shift) {
      return res.status(404).json({
        message: "Shift not found",
      });
    }

    return res.status(200).json({
      message: "Shift fetched successfully",
      shift,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching shift",
      error: error.message,
    });
  }
};

// UPDATE SHIFT
export const updateShiftById = async (req, res) => {
  try {
    const updatedShift = await shiftModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedShift) {
      return res.status(404).json({
        message: "Shift not found",
      });
    }

    return res.status(200).json({
      message: "Shift updated successfully",
      updatedShift,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating shift",
      error: error.message,
    });
  }
};

// DELETE SHIFT
export const deleteShiftById = async (req, res) => {
  try {
    const deletedShift = await shiftModel.findByIdAndDelete(req.params.id);

    if (!deletedShift) {
      return res.status(404).json({
        message: "Shift not found",
      });
    }

    return res.status(200).json({
      message: "Shift deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting shift",
      error: error.message,
    });
  }
};
