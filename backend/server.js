const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { verifyToken, authorizeRole } = require("./middleware/authMiddleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
require("./config/db");

// TEMPORARY PUBLIC TEST ROUTE
app.get("/test-public", (req, res) => {
    res.json({
        message: "Public route is working without token"
    });
});

// Import routes
const authRoutes = require("./routes/authRoutes");
const donorRoutes = require("./routes/donorRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const bloodGroupRoutes = require("./routes/bloodGroupRoutes");
const donationRoutes = require("./routes/donationRoutes");
const stockRoutes = require("./routes/stockRoutes");
const requestRoutes = require("./routes/requestRoutes");
const issueRoutes = require("./routes/issueRoutes");

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/blood-groups", bloodGroupRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/issues", issueRoutes);

// Root route
app.get("/", (req, res) => {
    res.send("Blood Management System Backend is Running!");
});

// Admin dashboard - protected route
app.get(
    "/api/admin/dashboard",
    verifyToken,
    authorizeRole("admin"),
    (req, res) => {
        res.json({
            message: "Welcome to Admin Dashboard!",
            user: req.user
        });
    }
);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});