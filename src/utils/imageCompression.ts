import { Image } from 'react-native';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';

export const MAX_UPLOAD_IMAGE_BYTES = 200 * 1024;

export interface CompressedImage {
  uri: string;
  type: 'image/jpeg';
  name: string;
  sizeInBytes: number;
}

function getImageDimensions(
  uri: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject);
  });
}

async function getFileSize(uri: string): Promise<number> {
  const normalizedPath = uri.startsWith('file://')
    ? uri.replace('file://', '')
    : uri;

  try {
    const stat = await RNFS.stat(normalizedPath);
    return Number(stat.size ?? 0);
  } catch {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob.size;
  }
}

function buildCompressedName(originalUri: string): string {
  const rawName = originalUri.split('/').pop()?.split('?')[0] ?? 'image';
  const baseName = rawName.replace(/\.[^/.]+$/, '');
  return `${baseName}-compressed.jpg`;
}

export async function compressImageForUpload(
  sourceUri: string,
  maxBytes: number = MAX_UPLOAD_IMAGE_BYTES,
): Promise<CompressedImage> {
  if (!sourceUri) {
    throw new Error('No image URI provided for compression.');
  }

  const { width, height } = await getImageDimensions(sourceUri);
  const qualitySteps = [80, 70, 60, 50, 40, 30];
  const scaleSteps = [1, 0.85, 0.7, 0.55, 0.45];

  let bestMatch: CompressedImage | null = null;

  for (const scale of scaleSteps) {
    const targetWidth = Math.max(320, Math.round(width * scale));
    const targetHeight = Math.max(320, Math.round(height * scale));

    for (const quality of qualitySteps) {
      const resized = await ImageResizer.createResizedImage(
        sourceUri,
        targetWidth,
        targetHeight,
        'JPEG',
        quality,
      );

      const sizeInBytes = await getFileSize(resized.uri);
      const currentCandidate: CompressedImage = {
        uri: resized.uri,
        type: 'image/jpeg',
        name: buildCompressedName(sourceUri),
        sizeInBytes,
      };

      if (!bestMatch || sizeInBytes < bestMatch.sizeInBytes) {
        bestMatch = currentCandidate;
      }

      if (sizeInBytes <= maxBytes) {
        return currentCandidate;
      }
    }
  }

  throw new Error(
    `Unable to compress image below ${maxBytes} bytes. Smallest result was ${
      bestMatch?.sizeInBytes ?? 'unknown'
    } bytes.`,
  );
}
