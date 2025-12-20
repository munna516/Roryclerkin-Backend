import { successResponse, errorResponse } from "../utils/response.js";
import { userService } from "../services/user.service.js";

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return errorResponse(res, 400, "Name, email and password are required");
        }
        const user = await userService.createUser(name, email, password);
        if (!user.success) {
            return errorResponse(res, user.status, user.message);
        }
        return successResponse(res, 201, "User registered successfully");
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