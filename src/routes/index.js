import express from "express";
import userRoutes from "./user.routes.js";
import quizRoutes from "./quiz.routes.js";
import playlistRoutes from "./playlist.routes.js";
import paymentRoutes from "./payment.routes.js";
const routes = express.Router();

routes.use("/auth/users", userRoutes);

routes.use("/quiz", quizRoutes);

routes.use("/playlists", playlistRoutes);

routes.use("/payment", paymentRoutes);


export default routes;