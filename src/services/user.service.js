import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import constants from "../config/constant.js";
import { errorResponse } from "../utils/response.js";

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
    }
}