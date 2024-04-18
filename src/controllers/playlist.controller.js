import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!(name && description)) {
    throw new ApiError(400, "All fields are required");
  }

  const playlist = await Playlist.create({
    name,
    description, 
    owner: req.user?._id, 
  });

  if (!playlist) {
    throw new ApiError(500, "something went wrong while creating playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { playlist }, "successfully created a playlist")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "UserId is required");
  }

  const playlists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "allvideos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
                {
                  $addFields: {
                    owner: {
                      $first: "$owner",
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ]);

  if (!playlists) {
    throw new ApiError(500, "something went wrong while getting playlist");
  }

  //it is not goging to work

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { playlists },
        "successfully fetched playlist of the users"
      )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new ApiError(400, "playlistId is required");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(500, " something went wrong while fetching playlists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { playlist }, "successfully fetched playlist"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!(playlistId && videoId)) {
    throw new ApiError(400, "all fields are required");
  }

  const playlist = await Playlist.updateOne(
    { _id: playlistId },
    { $push: { videos: videoId } }
  );

  if (!playlist) {
    throw new ApiError(
      500,
      "something went wrong while updating video to playlist"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { playlist },
        "sucessfully added video to the playlist "
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!(playlistId && videoId)) {
    throw new ApiError(400, "all fields are required");
  }
  
  const playlist = Playlist.updateOne(
    { _id: (new mongoose.Types.ObjectId(playlistId)).toString() }, 
    { $pull: { videoIds: (new mongoose.Types.ObjectId(videoId)).toString() } } 
  );
    // not working

  if (!playlist) {
    throw new ApiError(
      500,
      "something went wrong while removing video from playlist"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { playlist },
        "successfully removed video from the playlist"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  if (!(playlistId)) {
    throw new ApiError(400, "all fields are required");
  }

  const playlist = await Playlist.deleteOne({ _id: playlistId });

  if (!playlist) {
    throw new ApiError(500, "something went wrong while removing the playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { playlist }, "successfully deleted the playlist")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!(name && description && playlistId)) {
    throw new ApiError(400, "all fields are required");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      name,
      description,
    },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(500, "something went wrong while updating the playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { playlist }, "successfully updated the playlist")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
