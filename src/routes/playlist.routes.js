import express from "express";
import { getGuestPlaylist, getUserPlaylist } from "../controllers/playlist.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
const playlistRoutes = express.Router();

playlistRoutes.get("/guest/playlist/:id", getGuestPlaylist);
playlistRoutes.get("/user/playlist/:id", authMiddleware, getUserPlaylist);

export default playlistRoutes;
