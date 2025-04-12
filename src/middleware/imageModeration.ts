/** @format */

import axios from "axios";
import { promises } from "dns";
import { Request, Response, NextFunction, RequestHandler } from "express";
import FormData from "form-data";
import dotenv from "dotenv";
dotenv.config();

const sightengineUser = process.env.SIGHTENGINE_USER || "sightengine_user";
const sightengineSecret = process.env.SIGHTENGINE_SECRET;

export const moderateImage: RequestHandler = async (req, res, next): Promise<any> => {
  try {
    const profileImage = req.file;

    if (!profileImage) {
      res.status(400).json({ message: "No image uploaded" });
      return;
    }

    const formData = new FormData();
    formData.append("media", profileImage.buffer, {
      filename: profileImage.originalname,
      contentType: profileImage.mimetype,
    });
    formData.append("models", "nudity,wad"); // tambahkan detection yang kamu mau
    formData.append("api_user", sightengineUser);
    formData.append("api_secret", sightengineSecret);

    const response = await axios.post("https://api.sightengine.com/1.0/check.json", formData, {
      headers: formData.getHeaders(),
    });

    const result = response.data;

    // Contoh moderasi sederhana
    if (result.nudity.safe < 0.85 || result.weapon > 0.2 || result.alcohol > 0.2 || result.drugs > 0.2) {
      return res.status(400).json({ message: "Inappropriate image detected" });
    }

    next(); // lanjut ke controller
  } catch (error) {
    console.error("Image moderation failed:", error);
    res.status(500).json({ message: "Image moderation failed" });
  }
};
