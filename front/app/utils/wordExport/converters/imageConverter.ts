import { Paragraph, ImageRun } from 'docx';

import { ImageSection, WordExportError, WordExportErrorCode } from '../types';

// Default image dimensions if not provided
const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 400;

/**
 * Converts an ImageSection to Word paragraphs with embedded image.
 * Images are downloaded and converted to base64 for embedding.
 */
export async function convertImage(
  section: ImageSection
): Promise<Paragraph[]> {
  if (!section.src) {
    return [];
  }

  try {
    const imageData = await getImageData(section.src);
    const dimensions = await getImageDimensions(
      section.src,
      section.width,
      section.height
    );

    return [
      new Paragraph({
        children: [
          new ImageRun({
            data: imageData,
            transformation: {
              width: dimensions.width,
              height: dimensions.height,
            },
          }),
        ],
      }),
    ];
  } catch (error) {
    console.error('Failed to convert image:', error);
    throw new WordExportError(
      `Failed to load image: ${section.src}`,
      WordExportErrorCode.IMAGE_LOAD_FAILED,
      error
    );
  }
}

/**
 * Gets image data as Uint8Array from URL or base64 string.
 */
async function getImageData(src: string): Promise<Uint8Array> {
  // If already base64 data URL, extract the data
  if (src.startsWith('data:')) {
    const base64Data = src.split(',')[1];
    return Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
  }

  // Otherwise, fetch the image
  const response = await fetch(src);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 * Gets image dimensions, respecting provided constraints while maintaining aspect ratio.
 */
async function getImageDimensions(
  src: string,
  maxWidth?: number,
  maxHeight?: number
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.naturalWidth;
      let height = img.naturalHeight;

      // If dimensions provided, use them
      if (maxWidth && maxHeight) {
        resolve({ width: maxWidth, height: maxHeight });
        return;
      }

      // Scale down if needed while maintaining aspect ratio
      const targetWidth = maxWidth || DEFAULT_WIDTH;
      const targetHeight = maxHeight || DEFAULT_HEIGHT;

      if (width > targetWidth) {
        const ratio = targetWidth / width;
        width = targetWidth;
        height = height * ratio;
      }

      if (height > targetHeight) {
        const ratio = targetHeight / height;
        height = targetHeight;
        width = width * ratio;
      }

      resolve({ width: Math.round(width), height: Math.round(height) });
    };

    img.onerror = () => {
      // Use default dimensions on error
      resolve({
        width: maxWidth || DEFAULT_WIDTH,
        height: maxHeight || DEFAULT_HEIGHT,
      });
    };

    img.src = src;
  });
}

/**
 * Converts a base64 data URL to Uint8Array.
 * Utility function that can be used by other converters.
 */
export function base64ToUint8Array(base64DataUrl: string): Uint8Array {
  const base64Data = base64DataUrl.replace(/^data:image\/\w+;base64,/, '');
  return Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
}
