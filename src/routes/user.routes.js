import express from "express";
import { registerUser, loginUser, forgotPassword, verifyOTP, resetPassword } from "../controllers/user.controller.js";

const userRoutes = express.Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/login", loginUser);
userRoutes.post("/forgot-password", forgotPassword);
userRoutes.post("/verify-otp", verifyOTP);
userRoutes.post("/reset-password", resetPassword);


export default userRoutes;