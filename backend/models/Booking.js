const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "completed", "cancelled", "rejected"],
            default: "pending"
        },
        totalPrice: {
            type: Number,
            required: true
        },
        notes: {
            type: String
        },
        shortId: {
            type: String,
            unique: true
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

bookingSchema.virtual('review', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'booking',
    justOne: true
});


module.exports = mongoose.model("Booking", bookingSchema);
