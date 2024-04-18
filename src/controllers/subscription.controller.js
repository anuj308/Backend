import mongoose, { Mongoose } from "mongoose";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  //i do not know how to\ do it

  if (!subscriberId) {
    throw new ApiError(400, "subscriberId is required");
  }

  const subscription = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(subscriberId),
      },
    },
  ]);

  if (!subscription) {
    throw new ApiError(500, "internal server error");
  }

  if (subscription.length > 0) {
    // means it is subscribed
    const subcriptiondelete = await Subscription.deleteOne({
      $and: [{ channel: subscriberId }, { subscriber: req.user?._id }],
    });
    // console.log("deleted subscription")
  }else{
    var subscriptionNew = await Subscription.create({
      channel : subscriberId,
      subscriber : req.user?._id,
    }) 
    // console.log("created subscription")
  }

  return res
  .status(200)
  .json(new ApiResponse(200, `channel ${subscriptionNew ? "subscribed": "unsubcribed"}  sucessfully`))

});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "channelId is missing");
  }

  const subscriberList = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
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
              subscriber: {
                $first: "$subscriber",
              },
            },
          },
        ],
      },
    },
  ]);

  if (!subscriberList) {
    throw new ApiError(
      500,
      "something went wrong while getting subscriber list"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscriberList,
        "sucessfully fetched subscriber list"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!subscriberId) {
    throw new ApiError(400, " id is required");
  }

  const channelList = await Subscription.aggregate([
    {
      $match: {
        subscriber: subscriberId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
        pipeline: [
          {
            $project: {
              fullName: 1,
              avatar: 1,
              username: 1,
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

  if (!channelList) {
    throw new ApiError(500, "something went wrong while getting channel list");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelList, "sucessfully fetched channel list")
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
