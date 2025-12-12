import Lead from "../models/Lead.js";
import Quiz from "../models/Quiz.js";
import Playlist from "../models/Playlist.js";
import constants from "../config/constant.js";
import { sendEmail } from "../utils/email.js";

export const QuizService = {
    processGuestQuiz: async ({ answers, email }) => {

        // Create or update Lead (Guest)
        const lead = await Lead.findOneAndUpdate(
            { email },
            { email },
            { upsert: true, new: true }
        );

        // 🟦 3. Create quiz with default 15 songs
        const quiz = await Quiz.create({
            leadId: lead._id,
            answers,
            status: "processing",
            songCount: 15,
            isPremiumRequested: false
        });

        // // 🟦 4. Call AI service (15 songs)
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

        // Save playlist in DB
        const playlist = await Playlist.create({
            quizId: quiz._id,
            leadId: lead._id,
            title: playlistData.title,
            description: playlistData.description,
            tracks: playlistData.tracks,
            spotify_url: playlistData.spotify_url,
            songCount: playlistData.song_count,
            playlistType: "default"
        });

        //  Update quiz
        quiz.status = "done";
        quiz.vibeDetails = playlistData.vibe || null;
        await quiz.save();

        // Generate dynamic playlist link
        const playlistLink = `${constants.FRONTEND_URL}/playlist/${quiz._id}`;

        //Send email to guest
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
    }
};
