import Lead from "../models/Lead.js";
import Quiz from "../models/Quiz.js";
import Playlist from "../models/Playlist.js";
import constants from "../config/constant.js";
import { sendEmail } from "../utils/email.js";

export const QuizService = {
    processGuestQuiz: async ({ answers, email }) => {

        const lead = await Lead.findOneAndUpdate(
            { email },
            { email },
            { upsert: true, new: true }
        );

        const quiz = await Quiz.create({
            leadId: lead._id,
            answers,
            status: "processing",
            songCount: 15,
            isPremiumRequested: false
        });

        // const aiRes = await axios.post(process.env.AI_ENDPOINT, {
        //   answers,
        //   song_count: 15
        // });


        // if (!aiRes.data.success) {
        //   quiz.status = "failed";
        //   await quiz.save();
        //   throw new Error("AI Failed to generate playlist");
        // }

        const playlistData = {
            title: "Golden Nostalgia Party Mix",
            description: "A nostalgic blend of 70s, 80s, 90s and modern dance-pop, tailored for a lively evening celebration.",
            vibe: "Golden Nostalgia",
            song_count: 15,
            spotify_url: "https://open.spotify.com/playlist/4kHhLrNCp5mXfEXDummy",
            tracks: [
                { artist: "ABBA", song: "Dancing Queen" },
                { artist: "Whitney Houston", song: "I Wanna Dance with Somebody" },
                { artist: "Queen", song: "Don't Stop Me Now" },
                { artist: "Calvin Harris", song: "Feel So Close" },
                { artist: "Dua Lipa", song: "Don't Start Now" },
                { artist: "Fleetwood Mac", song: "Everywhere" },
                { artist: "Earth, Wind & Fire", song: "September" },
                { artist: "The Weeknd", song: "Blinding Lights" },
                { artist: "Bruno Mars", song: "24K Magic" },
                { artist: "Lady Gaga", song: "Rain on Me" },
                { artist: "Mark Ronson", song: "Uptown Funk" },
                { artist: "Coldplay", song: "Adventure of a Lifetime" },
                { artist: "Daft Punk", song: "Get Lucky" },
                { artist: "Avicii", song: "Wake Me Up" },
                { artist: "Maroon 5", song: "Sugar" }
            ]
        };


        // const playlistData = aiRes.data.playlist;

        const playlist = await Playlist.create({
            quizId: quiz._id,
            leadId: lead._id,
            title: playlistData.title,
            description: playlistData.description,
            tracks: playlistData.tracks,
            spotify_url: playlistData.spotify_url,
            song_count: playlistData.song_count,
            playlist_type: "default"
        });


        quiz.status = "done";
        quiz.vibeDetails = playlistData.vibe || null;
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
    },
    processUserQuiz: async ({ userId, answers, isPremiumRequested }) => {


        const quiz = await Quiz.create({
            userId,
            answers,
            isPremiumRequested: isPremiumRequested,
            status: isPremiumRequested ? "pending" : "processing",
            songCount: isPremiumRequested ? 50 : 15
        });


        if (!isPremiumRequested) {

            //   const aiRes = await axios.post(process.env.AI_ENDPOINT, {
            //     answers,
            //     song_count: 15
            //   });

            //   const playlistData = aiRes.data.playlist;
            const playlistData = {
                title: "Golden Nostalgia Party Mix",
                description: "A nostalgic blend of 70s, 80s, 90s and modern dance-pop, tailored for a lively evening celebration.",
                vibe: "Golden Nostalgia",
                song_count: 15,
                spotify_url: "https://open.spotify.com/playlist/4kHhLrNCp5mXfEXDummy",
                tracks: [
                    { artist: "ABBA", song: "Dancing Queen" },
                    { artist: "Whitney Houston", song: "I Wanna Dance with Somebody" },
                    { artist: "Queen", song: "Don't Stop Me Now" },
                    { artist: "Calvin Harris", song: "Feel So Close" },
                    { artist: "Dua Lipa", song: "Don't Start Now" },
                    { artist: "Fleetwood Mac", song: "Everywhere" },
                    { artist: "Earth, Wind & Fire", song: "September" },
                    { artist: "The Weeknd", song: "Blinding Lights" },
                    { artist: "Bruno Mars", song: "24K Magic" },
                    { artist: "Lady Gaga", song: "Rain on Me" },
                    { artist: "Mark Ronson", song: "Uptown Funk" },
                    { artist: "Coldplay", song: "Adventure of a Lifetime" },
                    { artist: "Daft Punk", song: "Get Lucky" },
                    { artist: "Avicii", song: "Wake Me Up" },
                    { artist: "Maroon 5", song: "Sugar" }
                ]
            };


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
            quiz.vibeDetails = playlistData.vibe || null;
            await quiz.save();

            return {
                type: "default",
                playlist,
                quizId: quiz._id
            };
        }
        console.log("Premium requested");
        return;

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: { name: "Premium Playlist (50 songs)" },
                        unit_amount: 500 // $5.00
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
