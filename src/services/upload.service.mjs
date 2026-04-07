import cloudinary from "../config/cloudinary.mjs";

export async function uploadImageToCloudinary(filePath) {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "tony-plantas/products",
    resource_type: "image",
  });

  return {
    imageUrl: result.secure_url,
    publicId: result.public_id,
  };
}

export function buildUploadResponse(uploadResult) {
  if (!uploadResult) {
    return null;
  }

  return {
    imageUrl: uploadResult.imageUrl,
    publicId: uploadResult.publicId,
  };
}
