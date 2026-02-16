const Service = require("../models/Service");

// @desc    Get all services with filtering
// @route   GET /api/services
// @access  Public
exports.getAllServices = async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice } = req.query;

        let query = { isActive: true };

        if (category) {
            query.category = category;
        }

        if (search) {
            query.title = { $regex: search, $options: "i" };
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const services = await Service.find(query).populate("provider", "name companyName");
        res.json(services);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id).populate("provider", "name companyName email");

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.json(service);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get provider services
// @route   GET /api/services/my-services
// @access  Private (Provider)
exports.getMyServices = async (req, res) => {
    try {
        const services = await Service.find({ provider: req.user.id });
        res.json(services);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Create a service
// @route   POST /api/services
// @access  Private (Provider)
exports.createService = async (req, res) => {
    try {
        if (req.user.role !== "company") {
            return res.status(403).json({ message: "Not authorized to create services" });
        }

        const { title, description, category, price, location } = req.body;

        const service = new Service({
            provider: req.user.id,
            title,
            description,
            category,
            price,
            location
        });

        await service.save();
        res.status(201).json(service);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private (Provider)
exports.updateService = async (req, res) => {
    try {
        let service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        if (service.provider.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized" });
        }

        service = await Service.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json(service);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private (Provider)
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        if (service.provider.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized" });
        }

        await service.deleteOne();
        res.json({ message: "Service removed" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};
