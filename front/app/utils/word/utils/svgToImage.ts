import { Canvg } from 'canvg';

interface SvgToImageOptions {
  width?: number;
  height?: number;
  scale?: number;
  backgroundColor?: string;
}

/**
 * Converts an SVG element to a PNG image buffer suitable for Word documents.
 * Uses Canvg to render SVG to canvas, then extracts as Uint8Array.
 *
 * @param svgElement - The SVG element to convert
 * @param options - Configuration options for the conversion
 * @returns Promise<Uint8Array> - PNG image data as Uint8Array for docx ImageRun
 */
export async function svgToImageBuffer(
  svgElement: SVGElement,
  options: SvgToImageOptions = {}
): Promise<Uint8Array> {
  const { scale = 2, backgroundColor = '#FFFFFF' } = options;

  // Clone the SVG to avoid modifying the original
  const clone = svgElement.cloneNode(true) as SVGElement;

  // Get original dimensions
  const originalWidth = svgElement.clientWidth || 800;
  const originalHeight = svgElement.clientHeight || 400;

  // Calculate target dimensions (use provided or scale original)
  const targetWidth = options.width || originalWidth * scale;
  const targetHeight = options.height || originalHeight * scale;

  // Set explicit dimensions on the clone for consistent rendering
  clone.setAttribute('width', String(targetWidth));
  clone.setAttribute('height', String(targetHeight));

  // Serialize SVG to string
  const svgContent = new XMLSerializer().serializeToString(clone);

  // Create canvas with target dimensions
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas 2D context');
  }

  // Fill background (SVGs are transparent by default)
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // Render SVG to canvas using Canvg
  const v = await Canvg.fromString(ctx, svgContent, {
    ignoreDimensions: true,
    scaleWidth: targetWidth,
    scaleHeight: targetHeight,
  });

  await v.render();

  // Convert canvas to blob, then to Uint8Array
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error('Failed to convert canvas to blob'));
          return;
        }

        try {
          const arrayBuffer = await blob.arrayBuffer();
          resolve(new Uint8Array(arrayBuffer));
        } catch (error) {
          reject(error);
        }
      },
      'image/png',
      1.0
    );
  });
}

/**
 * Gets the dimensions of an SVG element.
 * Useful for calculating aspect ratios.
 */
export function getSvgDimensions(svgElement: SVGElement): {
  width: number;
  height: number;
} {
  return {
    width: svgElement.clientWidth || 800,
    height: svgElement.clientHeight || 400,
  };
}

/**
 * Calculates scaled dimensions while maintaining aspect ratio.
 */
export function calculateScaledDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight?: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;

  let width = Math.min(originalWidth, maxWidth);
  let height = width / aspectRatio;

  if (maxHeight && height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return { width: Math.round(width), height: Math.round(height) };
}
