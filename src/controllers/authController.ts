/** @format */

// server/src/controllers/authController.ts
import { Request, Response } from "express";
import User from "../models/userModel";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "0d43b43a960c5d1f27c163e8a2ddd015583610956954f26e000761952134d868b56c741c5fb3f5e49b7eb06aaadc121ea9be3b18e407f13b25de8405a7bace6f1507636e4a6fa6bf9f6b5c2e165f3bbd58edf1518ddd911d0d727c3bc8151fe8e6b317fcd358e0ed9c15ea47a8031911b047b35f66cbc3e55f12b47d8b6dae5a";
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Generate a random 6-digit verification code
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
const sendVerificationEmail = async (email: string, code: string) => {
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: "Verify Your Email - KedaiCuple",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to KedaiCuple!</h2>
          <p>Thank you for signing up. To complete your registration, please use the following verification code:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
            ${code}
          </div>
          <p>This code will expire in 30 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
        </div>
      `,
  };

  await transporter.sendMail(mailOptions);
};

// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

// Signup controller
export const registerUser = async (req: Request, res: Response): Promise<any> => {
  try {
    console.log("Signup request received:", req.body);
    const { name, email, phoneNumber, password } = req.body;

    if (!name || !email || !phoneNumber || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const codeExpiry = new Date();
    codeExpiry.setMinutes(codeExpiry.getMinutes() + 30); // Code expires in 30 minutes

    // Create new user
    const newUser = new User({
      name,
      email,
      phoneNumber,
      password,
      verificationCode,
      codeExpiry,
      isVerified: false,
    });

    await newUser.save();

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      message: "User registered successfully. Verification code sent to email.",
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Error registering user" });
  }
};

// Verify code controller
export const verifyCode = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if code is valid and not expired
    if (user.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (user.codeExpiry && user.codeExpiry < new Date()) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationCode = undefined;
    user.codeExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Email verification successful" });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Error verifying code" });
  }
};

// Login controller
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({ message: "Please verify your email before logging in" });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateToken(user._id.toString());

    // Return user details and token
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
};

// Resend verification code
export const resendCode = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const codeExpiry = new Date();
    codeExpiry.setMinutes(codeExpiry.getMinutes() + 30);

    // Update user with new code
    user.verificationCode = verificationCode;
    user.codeExpiry = codeExpiry;
    await user.save();

    // Send new verification email
    await sendVerificationEmail(user.email, verificationCode);

    res.status(200).json({ message: "Verification code resent" });
  } catch (error) {
    console.error("Resend code error:", error);
    res.status(500).json({ message: "Error resending verification code" });
  }
};

// user Profile Complete
export const completeProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, userId } = req.body;
    const profileImage = req.file;

    if (!userId || !name) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Simpan image sebagai base64
    let profileImageBase64;
    if (profileImage) {
      profileImageBase64 = `data:${profileImage.mimetype};base64,${profileImage.buffer.toString("base64")}`;
      user.profileImage = profileImageBase64;
    }

    user.name = name;
    user.isProfileComplete = true;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Complete profile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// Complete registration (after location is set)
export const completeRegistration = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    // Return user details and token
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Complete registration error:", error);
    res.status(500).json({ message: "Error completing registration" });
  }
};
