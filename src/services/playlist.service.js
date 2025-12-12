import Playlist from "../models/Playlist.js";

export const PlaylistService = {
    getGuestPlaylist: async (id) => {
        const playlist = await Playlist.findOne({ quizId: id });
        if (!playlist) {
            throw new Error("Playlist not found");
        }
        return playlist;
    },
    getUserPlaylist: async (id) => {
        const playlist = await Playlist.findOne({ quizId: id });
        if (!playlist) {
            throw new Error("Playlist not found");
        }
        return playlist;
    }
}

