const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, bookingController.createBooking);
router.get("/my-bookings", protect, bookingController.getMyBookings);
router.put("/:id/cancel", protect, bookingController.cancelBooking);
router.put("/:id/status", protect, authorize("company"), bookingController.updateBookingStatus);


module.exports = router;



module.exports = router;
