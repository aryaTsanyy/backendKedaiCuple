/** @format */

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import connectDB from "./config/db";
import dotenv from "dotenv";
import productRoutes from "./routes/produkRoutes";
import categoryRoutes from "./routes/categoriesRoutes";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get("/", (_req, res) => {
  res.send("Restaurant Menu API is running");
});

//route
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

// Global error handling middleware
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

// Connect to database
connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit process if database connection fails
  });
const PORT = parseInt(process.env.PORT || "5000", 10);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://192.168.59.99:${PORT}`);
});
