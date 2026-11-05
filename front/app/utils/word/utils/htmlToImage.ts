import html2canvas from 'html2canvas';

import { svgElementToImageBuffer, findChartSvg } from './svgToImage';

interface HtmlToImageOptions {
  scale?: number;
  backgroundColor?: string;
  forceRaster?: boolean;
}

export interface ImageCaptureResult {
  buffer: Uint8Array;
  width: number;
  height: number;
}

export async function htmlToImageBuffer(
  element: HTMLElement,
  options: HtmlToImageOptions = {}
): Promise<ImageCaptureResult> {
  const {
    scale = 2,
    backgroundColor = '#FFFFFF',
    forceRaster = false,
  } = options;

  const chartSvg = !forceRaster ? findChartSvg(element) : null;
  if (chartSvg) {
    try {
      const rect = chartSvg.getBoundingClientRect();
      const buffer = await svgElementToImageBuffer(chartSvg, {
        scale,
        backgroundColor,
      });
      return {
        buffer,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    } catch {
      // Fall through to html2canvas
    }
  }

  const canvas = await html2canvas(element, {
    scale,
    backgroundColor,
    useCORS: true,
    logging: false,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error('Failed to convert canvas to blob'));
          return;
        }
        try {
          const arrayBuffer = await blob.arrayBuffer();
          // html2canvas measures the element inside its cloned document, which
          // can lay out at a different size than the live one. Reporting the
          // canvas size keeps the declared aspect ratio equal to the pixel
          // data, so Word scales the image instead of stretching it.
          resolve({
            buffer: new Uint8Array(arrayBuffer),
            width: Math.round(canvas.width / scale),
            height: Math.round(canvas.height / scale),
          });
        } catch (error) {
          reject(error);
        }
      },
      'image/png',
      1.0
    );
  });
}
