import facilityModel from "../model/facilityModel.js";
import User from "../model/userModel.js";
import applicationModel from "../model/applicationModel.js";



// create facility (requires authenticated facility user)
export const createFacility = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'facility') {
      return res.status(403).json({ message: 'Only facility users can create a facility' });
    }

    const { facilityName, phoneNumber, address, licenseNumber } = req.body;

    if (!facilityName || !licenseNumber) {
      return res.status(400).json({ message: 'facilityName and licenseNumber are required' });
    }

    // prevent duplicate facility for same user
    const existing = await facilityModel.findOne({ createdBy: userId });
    if (existing) {
      return res.status(400).json({ message: 'Facility already exists for this account' });
    }

    const newFacility = await facilityModel.create({
      facilityName,
      email: user.email,
      phoneNumber,
      address,
      licenseNumber,
      createdBy: userId
    });

    return res.status(201).json({ message: 'Facility created successfully', newFacility });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating facility', error: error.message });
  }
};

// get all facilities
export const getAllFacility = async (req, res) => {
  try {
    const facilities = await facilityModel.find();
    return res
      .status(200)
      .json({ message: "Facilities successfully fetched", facilities });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fecthing facilities", error });
  }
};

//get one facility by ID
export const getOneFacilityById = async (req, res) => {
  try {
    const { id } = req.params;
    const facility = await facilityModel.findById(id);
    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }
    return res
      .status(200)
      .json({ message: "Facility fetched successfully", facility });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching facility", error });
  }
};

//update facility by ID
export const updateOneFacilityById = async (req, res) => {
  try {
    const { facilityName, email, phoneNumber, address } = req.body;
    const { id } = req.params;
    const updateFacility = await facilityModel.findByIdAndUpdate(
      id,
      { facilityName, email, phoneNumber, address },
      { new: true },
    );
    if (!updateFacility) {
      return res.status(404).json({ message: "Facility not found" });
    }
    return res
      .status(200)
      .json({ message: "Facility successfully updated", data: updateFacility });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error update fail", error: error.message });
  }
};

// delete facility by ID
export const deleteOneFacilityById = async (req, res) => {
  try {
    const deleteFacility = await facilityModel.findByIdAndDelete(req.params.id);
    return res
      .status(200)
      .json({ message: "Facility deleted successfully", data: deleteFacility });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting facility", error: error.message });
  }
};
// get all applications for a facility
export const getApplicationsForFacility = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'facility') {
      return res.status(403).json({ message: 'Only facility users can view applications' });
    }

    const facility = await facilityModel.findOne({ createdBy: userId });
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    const applications = await applicationModel.find({ facility: facility._id });

    return res.status(200).json({ message: 'Applications fetched successfully', applications });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
};

// get shiftapplicants 
export const getShiftApplicants = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const applicants = await applicationModel.find({ shift: shiftId }).populate({
      path: 'workerId',
      select: 'firstName lastName email specialty certifications ',
    });
    return res.status(200).json({ message: 'Applicants fetched successfully', applicants });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching applicants', error: error.message });
  }
};
    