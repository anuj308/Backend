import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.models.js";
import mongoose, {isValidObjectId} from "mongoose"

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const c = videoId.isValidObjectId()//testing if it works or not if works then do in all
  if (!c) {
    throw new ApiError(400, "video id is missing");
  }

  const likeExist = await Like.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
  ]);

  if (!likeExist) {
    const like = await Like.create({
      video: videoId,
      likedBy: req.user?._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, like, "the video is liked"));
  } else {
    const like = await Like.deleteOne((_id = likeExist?._id));
    return res
      .status(200)
      .json(new ApiResponse(200, like, "the video is Unliked"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "tweet id is missing");
  }

  const tweetExist = await Like.aggregate([
    {
      $match: {
        tweet : new mongoose.Types.ObjectId(tweetId),
      },
    },
  ]);

  if (!tweetExist) {
    const like = await Like.create({
      tweet: tweetId,
      likedBy: req.user?._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, like, "the tweet is liked"));
  } else {
    const like = await Like.deleteOne((_id = tweetExist?._id));
    return res
      .status(200)
      .json(new ApiResponse(200, like, "the tweet is Unliked"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "video id is missing");
  }

  const commmentExist = await Like.aggregate([
    {
      $match: {
        comment: new mongoose.Types.ObjectId(commentId),
      },
    },
  ]);

  if (!commmentExist) {
    const like = await Like.create({
      comment: commentId,
      likedBy: req.user?._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, like, "the comment is liked"));
  } else {
    const like = await Like.deleteOne((_id = commmentExist?._id));
    return res
      .status(200)
      .json(new ApiResponse(200, like, "the comment is Unliked"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: { likedBy: new mongoose.Types.ObjectId(req.user?._id) },
    },
    {
      $lookup: {
        from: "videos",
        localField: "likedBy",
        foreignField: "_id",
        as: "likedVideos",
        pipline: [
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

  if (!likedVideos) {
    throw new ApiError(500, "internal server error while getting liked videos");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Successfully fetched liked videos")
    );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
