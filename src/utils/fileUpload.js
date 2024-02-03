import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "dxee5pfbx" || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: "968522518232427" || process.env.CLOUDINARY_API_KEY,
  api_secret:
    "pjIjhoYvFX9rnEaahB9KE8WQLew" || process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // console.log("file is uploaded in cloudinary ", response.url);
    fs.unlinkSync(localFilePath)
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath)// remove the  locally saved file as upload operation got failed
    return null;
  }
};

export { uploadOnCloudinary }