import express from "express";
import userRoutes from "./user.routes.js";
import quizRoutes from "./quiz.routes.js";
const routes = express.Router();

routes.use("/auth/users", userRoutes);

routes.use("/quiz", quizRoutes);

export default routes;