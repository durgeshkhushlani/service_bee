const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/signup", authController.signup);
router.post("/verify-otp", authController.verifyOtp);
router.post("/login", authController.login);

router.get("/profile", authMiddleware.protect, authController.getProfile);
router.put("/profile", authMiddleware.protect, authController.updateProfile);

module.exports = router;
