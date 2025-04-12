/** @format */

import express from "express";
import multer from "multer";
import { registerUser, verifyCode, login, resendCode, completeRegistration, completeProfile } from "../controllers/authController";
import { moderateImage } from "../middleware/imageModeration";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/signup", registerUser);
router.post("/verify", verifyCode);
router.post("/login", login);
router.post("/resend-code", resendCode);
router.post("/complete-registration", completeRegistration);
router.post("/complete-profile", upload.single("profileImage"), moderateImage, completeProfile);

export default router;
