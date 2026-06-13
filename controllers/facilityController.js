import facilityModel from "../model/facilityModel.js";
import User from "../model/userModel.js";

// create facility (requires authenticated facility user)
export const createFacility = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "facility") {
      return res
        .status(403)
        .json({ message: "Only facility users can create a facility" });
    }

    const { facilityName, phoneNumber, address, licenseNumber } = req.body;

    if (!facilityName || !licenseNumber) {
      return res
        .status(400)
        .json({ message: "facilityName and licenseNumber are required" });
    }

    // prevent duplicate facility for same user
    const existing = await facilityModel.findOne({ createdBy: userId });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Facility already exists for this account" });
    }

    const newFacility = await facilityModel.create({
      facilityName,
      email: user.email,
      phoneNumber,
      address,
      licenseNumber,
      createdBy: userId,
    });

    return res
      .status(201)
      .json({ message: "Facility created successfully", newFacility });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error creating facility", error: error.message });
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

// update profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const imageUrl = await streamUploadToCloudinary(
      req.file.buffer,
      "medhirely_profiles",
    );

    const facility = await facilityModel
      .findOneAndUpdate(
        { user: req.user.id },
        { $set: { profilePicture: imageUrl } },
        { new: true },
      )
      .select("-password");

    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      data: facility,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// update worker certifications
export const updateCertifications = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "please upload a valid national document",
      });
    }
    // loop through the files and upload each one to cloudinary, then get the urls and save them in the worker's certifications array
    const uploadPromises = req.files.map((file) =>
      streamUploadToCloudinary(file.buffer, "medhirely_certifications"),
    );
    // wait for all uploads to finish and get the urls, then create an array of certification objects with the name and url, and push them to the worker's certifications array
    const uploadedUrls = await Promise.all(uploadPromises);
    const newCertifications = uploadedUrls.map((url, index) => {
      return {
        name: req.body.certNames
          ? Array.isArray(req.body.certNames)
            ? req.body.certNames[index]
            : req.body.certNames
          : req.files[index].originalname,
        documentUrl: url,
      };
    });

    const facility = await facilityModel
      .findOneAndUpdate(
        { user: req.user.id },
        { $push: { certifications: { $each: newCertifications } } },
        { new: true },
      )
      .select("-password");

    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    res.status(200).json({
      success: true,
      message: "Certifications updated successfully",
      data: facility,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
