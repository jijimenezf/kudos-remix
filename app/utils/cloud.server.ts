import {
    unstable_composeUploadHandlers,
    unstable_createMemoryUploadHandler,
    unstable_parseMultipartFormData,
} from "@remix-run/node";
import { writeAsyncIterableToWritable } from "@remix-run/node";
import type {
    UploadApiOptions,
    UploadApiResponse,
    UploadStream,
} from "cloudinary";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.KUDOS_CLOUD_NAME,
    api_key: process.env.KUDOS_CLOUD_API_KEY,
    api_secret: process.env.KUDOS_CLOUD_SECRET,
});

export async function uploadAvatar(request: Request) {
    try {
        const uploadHandler = unstable_composeUploadHandlers(
            // our custom upload handler
            async ({ name, contentType, data, filename }) => {
                if (name !== "profile-pic") {
                    return undefined;
                }
                const uploadedImage = await uploadImageToCloudinary(data);
                return uploadedImage.secure_url;
            },
            // fallback to memory for everything else
            unstable_createMemoryUploadHandler()
        );

        const formData = await unstable_parseMultipartFormData(
            request,
            uploadHandler
        );

        const imageUrl = formData.get("profile-pic");
        return imageUrl;
    } catch (err) {
        console.log(err);
        throw new Error(`The provided file was not uploaded to the cloud`);
    }
}

async function uploadImageToCloudinary(data: AsyncIterable<Uint8Array>) {
    const uploadPromise = new Promise<UploadApiResponse>(
        async (resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "remix",
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(result);
                }
            );
            await writeAsyncIterableToWritable(data, uploadStream);
        }
    );

    return uploadPromise;
}
