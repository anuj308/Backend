import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // const { page = 1, limit = 10 } = req.query;

  const videoComment = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        form: "users",
        localfield: "owner",
        foreginfield: "_id",
        as: "ownerOfComment",
        pipeline: [
          {
            $project: {
              fullName: 1,
              avatar: 1,
              userName: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
  ]);

  if (!videoComment) {
    throw new ApiError(
      500,
      "something went wrong while getting videos comment "
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        videoComment,
        "sucessfully fetched all the videosComments"
      )
    );
});

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;

  if (!(content && videoId)) {
    throw new ApiError(400, " content and videoId is required");
  }

  const comment = await Comment.create({
    content: content,
    video: videoId,
    owner: req.users?._id,
  });

  if (!comment) {
    throw new ApiError(500, "somrthing went wrong while adding comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Successfully added comment"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { commentId } = req.params;

  if (!(content && commentId)) {
    throw new ApiError(400, " content and videoId is required");
  }

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { content },
    { new: true }
  );

  if (!comment) {
    throw new ApiError(500, "somrthing went wrong while adding comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Successfully Updated comment"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, " videoId is required");
  }

  const comment = await Comment.deleteOne({ _id: new mongoose.Types.ObjectId(commentId) }); // double quote in deleteOne

  if (!comment) {
    throw new ApiError(500, "somrthing went wrong while adding comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Successfully deleted comment"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
