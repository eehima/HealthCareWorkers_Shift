import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import dns from "dns";
import connectDB from "./config/db.js";
import workerRoutes from "./routes/workerRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import facilityRoutes from "./routes/facilityRoutes.js";
import shiftRoutes from "./routes/shiftRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Load environment variables
dotenv.config();

//dns fix for mongodb atlas issues
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// Connect to the database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});
// Auth routes
app.use('/api/auth', authRoutes);

// Worker routes
app.use("/api/workers", workerRoutes);

// Facility routes
app.use("/api/facilities", facilityRoutes);

// Shift routes
app.use("/api/shifts", shiftRoutes);

// Application routes
app.use("/api/applications", applicationRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
