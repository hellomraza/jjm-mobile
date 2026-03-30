import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@env';

function requireEnv(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(
      `Missing Cloudinary configuration: ${key}. Add it to your .env file.`,
    );
  }

  return value;
}

export const cloudinaryConfig = {
  cloudName: requireEnv(CLOUDINARY_CLOUD_NAME, 'CLOUDINARY_CLOUD_NAME'),
  uploadPreset: requireEnv(
    CLOUDINARY_UPLOAD_PRESET,
    'CLOUDINARY_UPLOAD_PRESET',
  ),
};
