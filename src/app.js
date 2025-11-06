require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => res.json({ ok: true, msg: "Task API running" }));
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

module.exports = app;
