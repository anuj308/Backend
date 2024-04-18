import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.models.js";
import mongoose from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "video id is missing");
  }

  const likeExist = await Like.aggregate([
    {
      $match: {
        $and: [
          { video: new mongoose.Types.ObjectId(videoId) },
          { likeBy: new mongoose.Types.ObjectId(req.user?._id) },
        ],
      },
    },
    {
      $project: {
        _id: 1,
      },
    },
  ]);
  // this has taken a lot of time for understanding what the error is
  // to get the _id from an object which is in array
  // can you can write this in better format please

  let a;
  likeExist.forEach((item) => {
    const _id = item._id;
    a = _id;
  });

  if (likeExist.length > 0) {
    const likedelete = await Like.deleteOne({ _id: a });
    return res
      .status(200)
      .json(new ApiResponse(200, likedelete, "the video is Unliked"));
  } else {
    const like = await Like.create({
      video: videoId,
      likeBy: req.user?._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { like }, `the video is liked`));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "tweet id is missing");
  }

  const likeExist = await Like.aggregate([
    {
      $match: {
        $and: [
          { tweet: new mongoose.Types.ObjectId(tweetId) },
          { likeBy: new mongoose.Types.ObjectId(req.user?._id) },
        ],
      },
    },
    {
      $project: {
        _id: 1,
      },
    },
  ]);
  let a;
  likeExist.forEach((item) => {
    const _id = item._id;
    a = _id;
  });

  if (likeExist.length > 0) {
    const likedelete = await Like.deleteOne({ _id: a });
    return res
      .status(200)
      .json(new ApiResponse(200, likedelete, "the tweet is Unliked"));
  } else {
    const like = await Like.create({
      tweet: tweetId,
      likeBy: req.user?._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { like }, `the tweet is liked`));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "tweet id is missing");
  }

  const likeExist = await Like.aggregate([
    {
      $match: {
        $and: [
          { comment: new mongoose.Types.ObjectId(commentId) },
          { likeBy: new mongoose.Types.ObjectId(req.user?._id) },
        ],
      },
    },
    {
      $project: {
        _id: 1,
      },
    },
  ]);
  let a;
  likeExist.forEach((item) => {
    const _id = item._id;
    a = _id;
  });

  if (likeExist.length > 0) {
    const likedelete = await Like.deleteOne({ _id: a });
    return res
      .status(200)
      .json(new ApiResponse(200, likedelete, "the comment is Unliked"));
  } else {
    const like = await Like.create({
      comment: commentId,
      likeBy: req.user?._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { like }, `the comment is liked`));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: { likeBy: new mongoose.Types.ObjectId(req.user?._id) },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideos",
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
