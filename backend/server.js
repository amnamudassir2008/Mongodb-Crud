const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const dns = require("dns");

const connectDB = require("./config/db");

dotenv.config();

// MongoDB DNS
dns.setServers(["8.8.8.8"]);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// Student Routes
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

// Home Route
app.get("/", (req, res) => {
  res.send("Student Management API is Running");
});

// Start Server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;