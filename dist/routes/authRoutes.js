"use strict";
/** @format */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
router.post("/signup", authController_1.signup);
router.post("/verify", authController_1.verifyCode);
router.post("/login", authController_1.login);
router.post("/resend-code", authController_1.resendCode);
router.post("/complete-registration", authController_1.completeRegistration);
exports.default = router;
