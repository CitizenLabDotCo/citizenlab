/**
 * Converts an HTML element to a PNG image buffer suitable for Word documents.
 *
 * Strategy: SVG-first with html2canvas fallback.
 * 1. If element contains a renderable <svg>, use svgElementToImageBuffer
 *    → crisp, reliable, no CORS, works in backgrounded tabs
 * 2. Fallback to html2canvas for non-SVG content (HTML cards, mixed layouts)
 */
import html2canvas from 'html2canvas';

import { svgElementToImageBuffer, hasSvgChart } from './svgToImage';

interface HtmlToImageOptions {
  scale?: number;
  backgroundColor?: string;
}

/**
 * Converts an HTML element to a PNG Uint8Array for use in docx ImageRun.
 * Prefers SVG serialization (better quality) over html2canvas DOM re-render.
 *
 * Drop-in replacement — same signature, same return type as before.
 */
export async function htmlToImageBuffer(
  element: HTMLElement,
  options: HtmlToImageOptions = {}
): Promise<Uint8Array> {
  const { scale = 2, backgroundColor = '#FFFFFF' } = options;

  // SVG-native path: best quality, no CORS, resolution-independent
  if (hasSvgChart(element)) {
    const svgEl = element.querySelector('svg')!;
    try {
      return await svgElementToImageBuffer(svgEl, { scale, backgroundColor });
    } catch (err) {
      // SVG serialization failed — fall through to html2canvas
      console.warn(
        '[htmlToImageBuffer] SVG capture failed, falling back to html2canvas:',
        err
      );
    }
  }

  // Fallback: html2canvas for non-SVG components (idea cards, mixed HTML, etc.)
  const canvas = await html2canvas(element, {
    scale,
    backgroundColor,
    useCORS: true,
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
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
