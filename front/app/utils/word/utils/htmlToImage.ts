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
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const elRect = element.getBoundingClientRect();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error('Failed to convert canvas to blob'));
          return;
        }
        try {
          const arrayBuffer = await blob.arrayBuffer();
          resolve({
            buffer: new Uint8Array(arrayBuffer),
            width: Math.round(elRect.width),
            height: Math.round(elRect.height),
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
