import Quiz from "../models/Quiz.js";
import Playlist from "../models/Playlist.js";
import constants from "../config/constant.js";
import { sendEmail } from "../utils/email.js";
import User from "../models/User.js";
import Stripe from "stripe";
import axios from "axios";

const stripe = new Stripe(constants.STRIPE_SECRET_KEY);

export const QuizService = {
    processGuestQuiz: async ({ answers, email }) => {

        const user = await User.findOneAndUpdate(
            { email },
            { type: "guest" },
            { upsert: true, new: true }
        );

        const quiz = await Quiz.create({
            userId: user._id,
            answers,
            status: "processing",
            songCount: 15,
            is_premium_requested: false
        });


        try {
            const aiRes = await axios.post(constants.AI_ENDPOINT + "/generate-playlist", {
                answers,
                song_count: 15
            });



            if (aiRes.status !== 200) {
                quiz.status = "failed";
                await quiz.save();
                throw new Error("AI Failed to generate playlist");
            }

            const playlistData = aiRes.data.playlist;
            const playlist = await Playlist.create({
                userId: user._id,
                quizId: quiz._id,
                title: playlistData.title,
                description: playlistData.description,
                tracks: playlistData.tracks,
                spotify_url: playlistData.spotify_url,
                song_count: playlistData.song_count,
                playlist_type: "default"
            });

            quiz.status = "done";
            quiz.vibe_details = playlistData.vibe || null;
            await quiz.save();

            const playlistLink = `${constants.FRONTEND_URL}/playlist/${quiz._id}`;

            await sendEmail(
                email,
                "Your Personalized Playlist is Ready!",
                `Click the link to view your playlist: ${playlistLink}`
            );

            return {
                success: true,
                message: "Playlist sent to email!",
                playlistLink
            };
        } catch (error) {
            console.log(error);
        }
    },

    processUserQuiz: async ({ userId, answers, isPremiumRequested }) => {
        const quiz = await Quiz.create({
            userId,
            answers,
            is_premium_requested: isPremiumRequested,
            status: isPremiumRequested ? "pending" : "processing",
            song_count: isPremiumRequested ? 50 : 15
        });


        if (!isPremiumRequested) {

            const aiRes = await axios.post(constants.AI_ENDPOINT + "/generate-playlist", {
                answers,
                song_count: 15
            });

            const playlistData = aiRes.data.playlist;

            const playlist = await Playlist.create({
                userId,
                quizId: quiz._id,
                title: playlistData.title,
                description: playlistData.description,
                tracks: playlistData.tracks,
                spotify_url: playlistData.spotify_url,
                song_count: playlistData.song_count || 15,
                playlist_type: "default"
            });


            quiz.status = "done";
            quiz.vibe_details = playlistData.vibe || null;
            await quiz.save();

            return {
                type: "default",
                playlist,
                quizId: quiz._id
            };
        }

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: { name: "Premium Playlist (50 songs)" },
                        unit_amount: 900
                    },
                    quantity: 1
                }
            ],
            success_url: `${process.env.FRONTEND_URL}/premium-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/premium-cancel`,
            metadata: {
                quizId: quiz._id.toString(),
                userId: userId.toString(),
                premium: "true"
            }
        });

        return {
            type: "premium_payment",
            checkoutUrl: session.url,
            quizId: quiz._id
        };
    },
};
