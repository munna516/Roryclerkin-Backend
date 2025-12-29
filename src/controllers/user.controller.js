import { successResponse, errorResponse } from "../utils/response.js";
import { userService } from "../services/user.service.js";

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return errorResponse(res, 400, "Name, email and password are required");
        }
        const user = await userService.createUser(name, email, password);
        if (user?._id) {
            return successResponse(res, 201, "User registered successfully", user);
        }
        return errorResponse(res, 400, user.message);
    } catch (error) {
        const status = error.status || 500;
        return errorResponse(res, status, error.message);
    }
}

export const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return errorResponse(res, 400, "Email and password are required");
        }
        const result = await userService.loginUser(email, password);
        const { user, token } = result;
        // save token to cookie
        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 30 * 24 * 60 * 60 * 1000 });
        return successResponse(res, 200, "User logged in successfully", { user, token });
    } catch (error) {
        const status = error.status || 500;
        return errorResponse(res, status, error.message);
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return errorResponse(res, 400, "Email is required");
        }
        const result = await userService.forgotPassword(email);
        if (result.success) {
            return successResponse(res, 200, result.message, result);
        }
        return errorResponse(res, 400, result.message);
    } catch (error) {
        const status = error.status || 500;
        return errorResponse(res, status, error.message);
    }
}

export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return errorResponse(res, 400, "Email and OTP are required");
        }

        const result = await userService.verifyOTP(email, otp);
        if (result.success) {
            return successResponse(res, 200, result.message, result);
        }
        return errorResponse(res, 400, result.message);
    } catch (error) {
        const status = error.status || 500;
        return errorResponse(res, status, error.message);
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return errorResponse(res, 400, "Email and password are required");
        }
        const result = await userService.resetPassword(email, newPassword);
        if (result.success) {
            return successResponse(res, 200, result.message, result);
        }
        return errorResponse(res, 400, result.message);
    } catch (error) {
        const status = error.status || 500;
        return errorResponse(res, status, error.message);
    }
}