import axios from "axios";

const CLOUD_NAME = "dyehf76cm";
const UPLOAD_PRESET = "Intranet_library_repository";

export async function uploadToCloudinary(file) {
  if (!file) throw new Error("No file provided");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data.secure_url;
}
