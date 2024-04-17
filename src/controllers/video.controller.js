import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const videoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (
    [title, description, videoLocalPath, thumbnailLocalPath].some(
      (fields) => fields?.trim() === ""
    ) 
  ) {
    throw new ApiError(400, "all fields are required");
  }
  // let see upppp testing 
  // console.log(videoLocalPath)
  // console.log(thumbnailLocalPath)

  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnail) {
    throw new ApiError(400, "thumbnail is required");
  }

  const videoUpload = await Video.create({
    title,
    description,
    videoFile: video.url,
    thumbnail : thumbnail.url,
    duration: video.duration,
    view: 0,
    isPublished: true,
    owner: req.user?._id,
  });

  if (!videoUpload) {
    throw new ApiError(500, "something went wrong file is not uploaded ");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videoUpload, " uploded video successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, " videoid is required");
  }

  const video = await Video.findById(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, video, " fetched video details"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const thumbnail = req.file?.path;

  if (title || description || thumbnail) {
    throw new ApiError(400, "ALl fields are required");
  }

  const thumbnailNew = uploadOnCloudinary(thumbnail);

  const updateVideoInfo = await Video.findByIdAndUpdate(
    videoId,
    {
      title,
      description,
      thumbnail: thumbnailNew,
    },
    {
      new: true,
    }
  );

  if (!updateVideoInfo) {
    throw new ApiError(500, "something went wrong while updating video info");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updateVideoInfo, "the video is updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError("videoID is missing");
  }

  const video = await Video.deleteOne((_id = videoId));

  if (!video) {
    throw new ApiError(500, "something went wrong while deleting video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "deleted video successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "videoID is required");
  }

  const video = await Video.findById(videoId);

  if (!video.isPublished == true) {
    const videoStatus = await Video.findByIdAndUpdate(
      videoId,
      {
        isPublished: false,
      },
      { new: true }
    );
  } else {
    const videoStatus = await Video.findByIdAndUpdate(
      videoId,
      {
        isPublished: true,
      },
      { new: true }
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        videoStatus,
        `video is ${videoStatus.isPublished == true ? "published" : "Unpublished"} Sucessfully `
      )
    );
});

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
  // while updated this later as i have to study aggregation pipleline for this

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
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
  ]);

  if (!video) {
    throw new ApiError(500, "somrthing went wrong while getting videos");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "fetched all video "));
});

export {publishAVideo,getAllVideos,getVideoById,updateVideo,deleteVideo,togglePublishStatus};