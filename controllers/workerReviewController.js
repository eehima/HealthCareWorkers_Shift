import workerReviewModel from "../model/workerReviewModel.js";
//CREATE REVIEW
export const reviewWorker = async (req, res) => {
  try {
    const { workerId, shiftId } = req.params;
    const { facilityId, rating, comment } = req.body;

    const review = await workerReviewModel.create({
      workerId,
      facilityId,
      shiftId,
      rating,
      comment,
    });

    return res.status(201).json({
      message: "Worker reviewed successfully",
      review,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error reviewing worker",
      error: error.message,
    });
  }
};

//GET ALL REVIEWS
export const getWorkerReviews = async (req, res) => {
  try {
    const { workerId } = req.params;

    const reviews = await workerReviewModel
      .find({ workerId })
      .populate("facilityId", "facilityName");

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;
    return res
      .status(200)
      .json({ totalReviews: reviews.length, averageRating, reviews });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching reviews",
      error: error.message,
    });
  }
};
