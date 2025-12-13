import Stripe from "stripe";
import constants from "../config/constant.js";
import Quiz from "../models/Quiz.js";
import Playlist from "../models/Playlist.js";
import { successResponse, errorResponse } from "../utils/response.js";
const stripe = new Stripe(constants.STRIPE_SECRET_KEY);

export const handleStripeWebhook = async (req, res) => {
    let event;
    console.log("this is the request", req.body);
    //  Verify webhook signature
    try {
        const sig = req.headers["stripe-signature"];

        event = stripe.webhooks.constructEvent(
            req.body, // RAW body
            sig,
            constants.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return errorResponse(res, 400, "Webhook Error");
    }

    //  Handle only checkout completion
    if (event.type === "checkout.session.completed") {
        try {
            const session = event.data.object;
            const { quizId, userId } = session.metadata;

            if (!quizId || !userId) {
                console.warn("Missing metadata, skipping");
                return successResponse(res, 200, "Premium playlist not generated");
            }

            const quiz = await Quiz.findById(quizId);
            if (!quiz) return errorResponse(res, 200, "Quiz not found");

            //  IDEMPOTENCY: prevent duplicate playlists
            const existingPlaylist = await Playlist.findOne({
                quizId,
                playlist_type: "premium"
            });

            if (existingPlaylist) {
                console.log("Premium playlist already exists for quiz:", quizId);
                return successResponse(res, 200, "Premium playlist already exists");
            }

            // Dummy playlist data (AI later)
            const playlistData = {
                title: "Golden Nostalgia Party Mix",
                description:
                    "A nostalgic blend of 70s, 80s, 90s and modern dance-pop.",
                song_count: 50,
                spotify_url:
                    "https://open.spotify.com/playlist/4kHhLrNCp5mXfEXDummy",
                tracks: [
                    { artist: "ABBA", song: "Dancing Queen" },
                    { artist: "Queen", song: "Don't Stop Me Now" },
                    { artist: "Dua Lipa", song: "Don't Start Now" }
                ]
            };

            //  Save premium playlist (schema-correct)
            await Playlist.create({
                quizId: quiz._id,
                userId,
                title: playlistData.title,
                description: playlistData.description,
                tracks: playlistData.tracks,
                spotify_url: playlistData.spotify_url,
                song_count: playlistData.song_count,
                playlist_type: "premium"
            });

            //  Update quiz
            quiz.status = "done";
            quiz.vibe_details = playlistData.title;
            await quiz.save();

            console.log("Premium playlist generated for quiz:", quizId);

        } catch (err) {
            console.error("Error processing checkout.session.completed:", err);
            // IMPORTANT: still return 200 so Stripe stops retrying
        }
    }

    //  Always acknowledge Stripe
    return successResponse(res, 200, "Premium playlist generated successfully");
};
