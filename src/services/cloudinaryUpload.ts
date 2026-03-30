import axios from 'axios';
import { cloudinaryConfig } from '../config/cloudinary';

export interface CloudinaryUploadFile {
  uri: string;
  type: string;
  name: string;
}

export interface UploadToCloudinaryOptions {
  onProgress?: (progressPercent: number) => void;
}

interface CloudinaryUploadResponse {
  secure_url: string;
}

export async function uploadToCloudinary(
  file: CloudinaryUploadFile,
  options: UploadToCloudinaryOptions = {},
): Promise<string> {
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;

  const formData = new FormData();
  formData.append('file', file as unknown as Blob);
  formData.append('upload_preset', cloudinaryConfig.uploadPreset);

  const response = await axios.post<CloudinaryUploadResponse>(
    endpoint,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: event => {
        if (!options.onProgress || !event.total) {
          return;
        }

        const progressPercent = Math.round((event.loaded / event.total) * 100);
        options.onProgress(progressPercent);
      },
    },
  );

  if (!response.data?.secure_url) {
    throw new Error(
      'Cloudinary upload failed: secure_url is missing in response.',
    );
  }

  return response.data.secure_url;
}
