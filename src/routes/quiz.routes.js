import express from "express";
import { submitGuestQuiz } from "../controllers/quiz.controller.js";

const quizRoutes = express.Router();

quizRoutes.post("/submit/guest", submitGuestQuiz);

export default quizRoutes;
