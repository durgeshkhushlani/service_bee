const Booking = require("../models/Booking");
const Service = require("../models/Service");

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Customer)
exports.createBooking = async (req, res) => {
    try {
        const { serviceId, date, notes } = req.body;

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        const booking = new Booking({
            customer: req.user.id,
            provider: service.provider,
            service: serviceId,
            date,
            totalPrice: service.price,
            notes,
            shortId: Math.random().toString(36).substr(2, 6).toUpperCase()
        });

        await booking.save();

        res.status(201).json(booking);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get my bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
    try {
        let bookings;
        if (req.user.role === "company") {
            bookings = await Booking.find({ provider: req.user.id })
                .populate("customer", "name email")
                .populate("service", "title price")
                .populate("review");
        } else {
            bookings = await Booking.find({ customer: req.user.id })
                .populate("provider", "name companyName")
                .populate("service", "title price")
                .populate("review");
        }

        res.json(bookings);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Ensure user owns the booking or is the provider
        if (booking.customer.toString() !== req.user.id && booking.provider.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized" });
        }

        if (booking.status === "completed" || booking.status === "cancelled") {
            return res.status(400).json({ message: "Cannot cancel this booking" });
        }

        booking.status = "cancelled";
        await booking.save();

        res.json(booking);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Update booking status (Provider)
// @route   PUT /api/bookings/:id/status
// @access  Private (Provider)
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.provider.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized" });
        }

        booking.status = status;
        await booking.save();

        res.json(booking);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};
