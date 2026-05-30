import facilityModel from "../model/facilityModel.js";



// create facility
export const createFacility = async (req, res) => {
  try {
    const { facilityName, email, phoneNumber, address, licenseNumber } =
      req.body;
    const newFacility = await facilityModel.create({
      facilityName,
      email,
      phoneNumber,
      address,
      licenseNumber,
    });
    return res
      .status(201)
      .json({ message: "Facility created successfully", newFacility });
  } catch (error) {
    return res.status(500).json({ message: "Error creating facility", error });
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
