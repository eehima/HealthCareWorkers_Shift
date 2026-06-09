// import cloudinary from 'cloudinary';
import { v2 as cloudinary } from 'cloudinary';

// reusable buffer to upload file to a specific cloudinary folder
export const streamUploadToCloudinary = async (buffer, folder) => {


    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
               if (result) {
                   resolve(result.secure_url);
               } else {
                   reject(error);
               };
            }
        );
        stream.end(buffer);
});
};