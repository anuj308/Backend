import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Tweet } from "../models/tweet.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import jwt from "jsonwebtoken";
// import mongoose from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!tweetContent) {
    throw new ApiError(400, " Content is required");
  }
  const tweet = await Tweet.create({
    ownner: req.user,
    content,
  });

  if (!tweet) {
    throw new ApiError(500, "something went wrong while creating content");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Successfully created the tweet"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId?.trim()) {
    throw new ApiError(400, "User id is missing");
  }

  const tweet = await Tweet.aggreate([
    {
      $match: {
        owner: userId,
      },
    },
  ]);

  if (!tweet) {
    throw new ApiError(404, "no tweets found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { tweet }, "Sucessfully fetched users tweets"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "Tweet id not found");
  }

  const tweet = await Tweet.deleteOne({ _id: tweetId });

  if (!tweet) {
    throw new ApiError(500, "something went wrong Could'nt delete tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200), { tweet }, "Sucessfully deleted the tweet");
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!tweetId) {
    throw new ApiError(400, "Tweet id not found");
  }
  if (!content) {
    throw new ApiError(400, "Content  not found");
  }

  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      content,
    },
    {
      new: true,
    }
  );

  if (!tweet) {
    throw new ApiError(500, "something went wrong Could'nt delete tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200), { tweet }, "Sucessfully Updated the tweet");
});

export { createTweet, getUserTweets,updateTweet,deleteTweet };
