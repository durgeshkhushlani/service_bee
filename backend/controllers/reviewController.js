const Review = require("../models/Review");
const Booking = require("../models/Booking");

// @desc    Create a review for a completed booking
// @route   POST /api/reviews
// @access  Private (Customer)
exports.createReview = async (req, res) => {
    try {
        const { bookingId, rating, comment } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Check ownership and status
        if (booking.customer.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized to review this booking" });
        }

        if (booking.status !== "completed") {
            return res.status(400).json({ message: "Can only review completed bookings" });
        }

        // Check if already reviewed (Although frontend handles this, double check)
        const existingReview = await Review.findOne({ booking: bookingId });
        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this booking" });
        }

        const review = new Review({
            booking: bookingId,
            reviewer: req.user.id,
            provider: booking.provider,
            rating,
            comment
        });

        await review.save();

        res.status(201).json(review);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Customer)
exports.updateReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        let review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (review.reviewer.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized" });
        }

        review = await Review.findByIdAndUpdate(req.params.id, { rating, comment }, { new: true });
        res.json(review);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get reviews for a provider
// @route   GET /api/reviews/provider/:providerId
// @access  Public
exports.getProviderReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ provider: req.params.providerId })
            .populate("reviewer", "name")
            .populate({
                path: 'booking',
                select: 'shortId'
            })

            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get my reviews (as a provider)
// @route   GET /api/reviews/my-reviews
// @access  Private (Provider)
exports.getMyReviews = async (req, res) => {
    try {
        if (req.user.role !== 'company') {
            return res.status(403).json({ message: "Not authorized" });
        }

        const reviews = await Review.find({ provider: req.user.id })
            .populate("reviewer", "name")
            .populate({
                path: 'booking',
                select: 'shortId service',
                populate: { path: 'service', select: 'title' }
            })
            .sort({ createdAt: -1 });


        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};
