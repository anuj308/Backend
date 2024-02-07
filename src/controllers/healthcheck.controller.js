import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const healthcheck = asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200,"every thing is working solid"))
})

export {healthcheck};