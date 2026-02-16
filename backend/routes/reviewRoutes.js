const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, reviewController.createReview);
router.put("/:id", protect, reviewController.updateReview);

router.get("/my-reviews", protect, reviewController.getMyReviews);
router.get("/provider/:providerId", reviewController.getProviderReviews);

module.exports = router;
