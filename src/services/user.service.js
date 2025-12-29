import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import constants from "../config/constant.js";
import { errorResponse } from "../utils/response.js";
import { sendEmail } from "../utils/email.js";

export const userService = {
    createUser: async (name, email, password) => {
        const hashedPassword = await bcrypt.hash(password, 12);

        // Step 1: Check existing user
        const existingUser = await User.findOne({ email });

        if (existingUser && existingUser.type !== "guest") {
            return { success: false, message: "User already exists", status: 400 };
        }

        // Step 2: Create OR upgrade
        const user = await User.findOneAndUpdate(
            { email },
            {
                $set: {
                    name,
                    password: hashedPassword,
                    type: "user"
                },
                $setOnInsert: {
                    email
                }
            },
            {
                new: true,
                upsert: true
            }
        ).select("-password");

        return user;
    },

    loginUser: async (email, password) => {
        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error("User not found");

            throw error;
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            const error = new Error("Invalid password");

            throw error;
        }

        if (!constants.JWT_SECRET) {
            const error = new Error("JWT secret is not configured");
            error.status = 500;
            throw error;
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            constants.JWT_SECRET,
            { expiresIn: constants.JWT_EXPIRES_IN }
        );

        // Remove sensitive fields before returning
        const safeUser = {
            id: user._id,
            name: user.name,
            email: user.email,
            isPremium: user.isPremium,
            createdAt: user.createdAt,
        };

        return { user: safeUser, token };
    },

    forgotPassword: async (email) => {
        const user = await User.findOne({ email, type: "user" });
        if (!user) {
            return { success: false, message: "User not found", status: 400 };
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        user.passwordResetOTP = otp;
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
        user.isOTPVerified = false;
        await user.save();

        await sendEmail(email, "Password Reset OTP", `Your password reset OTP is ${otp}. This OTP will expire in 10 minutes.`);

        return { success: true, message: "Password reset email sent successfully", status: 200 };
    },
    verifyOTP: async (email, otp) => {
        const user = await User.findOne({ email, type: "user" }).select("passwordResetOTP passwordResetExpires isOTPVerified");
        if (!user) {
            return { success: false, message: "User not found", status: 400 };
        }
        if (user.passwordResetOTP !== otp) {
            return { success: false, message: "Invalid OTP", status: 400 };
        }
        if (user.passwordResetExpires < Date.now()) {
            return { success: false, message: "OTP expired", status: 400 };
        }
        user.isOTPVerified = true;
        await user.save();
        return { success: true, message: "OTP verified successfully", status: 200 };
    },
    resetPassword: async (email, newPassword) => {
        const user = await User.findOne({ email, type: "user", isOTPVerified: true }).select("password passwordResetOTP passwordResetExpires isOTPVerified");
        if (!user) {
            return { success: false, message: "User not found", status: 400 };
        }
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        user.passwordResetOTP = null;
        user.passwordResetExpires = null;
        user.isOTPVerified = false;
        await user.save();
        return { success: true, message: "Password reset successfully", status: 200 };
    }
}