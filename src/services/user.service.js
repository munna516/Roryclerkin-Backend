import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import constants from "../config/constant.js";

export const userService = {
    createUser: async (name, email, password) => {
        // check if user already exists
        const existing = await User.findOne({ email });
        if (existing) {
            const error = new Error("User already exists");
            error.status = 400;
            throw error;
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        return User.create({ name, email, password: hashedPassword });
    },

    loginUser: async (email, password) => {
        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error("User not found");
            error.status = 400;
            throw error;
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            const error = new Error("Invalid password");
            error.status = 400;
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