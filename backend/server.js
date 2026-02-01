require("dotenv").config();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const express = require("express");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const jwt = require("jsonwebtoken");



const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

console.log("MONGO_URI =", process.env.MONGO_URI);


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// helper function
function readData() {
  const data = fs.readFileSync(path.join(__dirname, "details.json"));
  return JSON.parse(data);
}

function writeData(data) {
  fs.writeFileSync(
    path.join(__dirname, "details.json"),
    JSON.stringify(data, null, 2)
  );
}

// SIGNUP
app.post("/api/signup", async (req, res) => {
  try {
    const { role, name, email, password, companyName, serviceType } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    const user = new User({
      role,
      name,
      email,
      password: hashedPassword,
      companyName: role === "company" ? companyName : undefined,
      serviceType: role === "company" ? serviceType : undefined,
      otp, 
      otpExpiry
    });

    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Service Bee - Verify your email",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`
    });


    res.json({ message: "Signup successful. Please verify your email." });
  } catch (err) {
    res.status(500).json({ message: "Signup could not be done" });
  }
});

app.post("/api/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.json({ message: "User already verified" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "OTP verification failed" });
  }
});



// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});


app.get("/api/test-email", async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Service Bee Test",
      text: "Nodemailer is working"
    });
    res.send("Email sent");
  } catch (e) {
    res.status(500).send("Email failed");
  }
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});