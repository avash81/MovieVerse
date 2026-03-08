const express = require("express");
const router = express.Router();
const reviewsController = require("../controllers/reviewsController");

// Submit a reply to a review
router.post(
  "/:source/:externalId/reply/:reviewId",
  reviewsController.submitReply,
);

// Get reviews
router.get("/:source/:externalId", reviewsController.getReviews);

// Submit a review
router.post("/:source/:externalId", reviewsController.submitReview);

module.exports = router;
