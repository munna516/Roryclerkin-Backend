import { successResponse, errorResponse } from "../utils/response.js";
import { userService } from "../services/user.service.js";

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return errorResponse(res, 400, "Name, email and password are required");
        }
        const user = await userService.createUser(name, email, password);
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
        return successResponse(res, 200, "User logged in successfully", result);
    } catch (error) {
        const status = error.status || 500;
        return errorResponse(res, status, error.message);
    }
}