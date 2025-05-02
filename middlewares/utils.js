import UniqueIdModel from "../model/UniqueId.js";
import cloudinary from "cloudinary";
import multer from "multer";

export const sendResponse = (res, statusCode, success, data, message) => {
    return res.status(statusCode).json({ success: success, data: data, message: message ? message : '' });
};

export async function generateUniqueCode(length) {
    const userId = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
        let uniqueId = ''; 

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            uniqueId += characters[randomIndex]; 
        }

        return uniqueId;
    };

    let uniqueId;
    let exists = true;

    while (exists) {
        uniqueId = userId();
        const existingId = await UniqueIdModel.findOne({ uniqueId: uniqueId });
        exists = existingId !== null; 
    }

    await UniqueIdModel.create({ uniqueId })
    return uniqueId;
}

// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    timeout: 120000, // 120 seconds
  });

  // Configure Multer
const storage = multer.memoryStorage(); // Use memory storage for direct streaming
const upload = multer({ storage });

export const uploadMiddleware = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "trackUrl", maxCount: 1 },
  { name: "trackImg", maxCount: 1 },
]);


  // Helper for uploading files to Cloudinary
export function uploadToCloudinary(fileBuffer, folder, resourceType) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        { folder, resource_type: resourceType },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
  
      const bufferStream = new PassThrough();
      bufferStream.end(fileBuffer); // End the stream with the buffer
      bufferStream.pipe(uploadStream); // Pipe the buffer to the Cloudinary stream
    });
  }
  