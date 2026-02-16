const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");

const { protect } = require("../middleware/authMiddleware");

router.get("/", serviceController.getAllServices);
router.get("/my-services", protect, serviceController.getMyServices);
router.get("/:id", serviceController.getServiceById);
router.post("/", protect, serviceController.createService);
router.put("/:id", protect, serviceController.updateService);
router.delete("/:id", protect, serviceController.deleteService);


module.exports = router;



module.exports = router;
