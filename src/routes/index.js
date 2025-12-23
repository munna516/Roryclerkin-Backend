import express from "express";
import userRoutes from "./user.routes.js";
import quizRoutes from "./quiz.routes.js";
import playlistRoutes from "./playlist.routes.js";
const routes = express.Router();

routes.use("/auth/users", userRoutes);

routes.use("/quiz", quizRoutes);

routes.use("/playlists", playlistRoutes);



export default routes;