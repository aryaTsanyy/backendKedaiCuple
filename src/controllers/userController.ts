/** @format */

import { Request, Response } from "express";
import User from "../models/userModel";

// Complete profile controller
export const completeProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId, name } = req.body;
    const profileImage = req.file ? `/uploads/${req.file.filename}` : undefined;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user profile
    user.name = name || user.name;
    if (profileImage) {
      user.profileImage = profileImage;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Complete profile error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

// Update location controller
/* export const updateLocation = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId, location } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user location
    user.location = {
      coordinates: location.coordinates,
      address: location.address,
    };

    await user.save();

    res.status(200).json({
      message: "Location updated successfully",
      location: user.location,
    });
  } catch (error) {
    console.error("Update location error:", error);
    res.status(500).json({ message: "Error updating location" });
  }
};
 */
