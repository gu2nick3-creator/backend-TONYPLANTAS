export function buildUploadResponse(file) {
  if (!file) {
    return null;
  }

  return {
    imageUrl: `/uploads/${file.filename}`,
  };
}
