/**
 * CONTROLLER — Upload
 *
 * Business logic for image uploads.
 * Delegates to Cloudinary via lib/cloudinary.
 * Returns the secure URL — no HTTP concerns here.
 */

import cloudinary from "@/lib/cloudinary";

export async function uploadImage(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "myifrane" },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Cloudinary upload failed"));
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}
