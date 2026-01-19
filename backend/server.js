const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

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
app.post("/api/signup", (req, res) => {
  const data = readData();

  data.users.push({
    ...req.body,
    timestamp: new Date().toISOString()
  });

  writeData(data);

  res.json({ message: "Signup data stored" });
});

// LOGIN
app.post("/api/login", (req, res) => {
  const { email, password, role } = req.body;

  const data = readData();

  const user = data.users.find(
    (u) =>
      u.email === email &&
      u.password === password &&
      u.role === role
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User does not exist"
    });
  }

  // optional: log login event
  data.users.push({
    email,
    role,
    action: "login",
    timestamp: new Date().toISOString()
  });

  writeData(data);

  res.json({
    success: true,
    message: "Login successful"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});