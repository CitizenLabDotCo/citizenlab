import { Canvg } from 'canvg';
import { Paragraph, ImageRun, TextRun, HeadingLevel } from 'docx';

import { ChartSection, WordExportError, WordExportErrorCode } from '../types';

import { base64ToUint8Array } from './imageConverter';

// Default chart dimensions
const DEFAULT_CHART_WIDTH = 600;
const DEFAULT_CHART_HEIGHT = 400;

// High resolution for rasterization (matches ReportExportMenu pattern)
const RASTERIZATION_MAX_SIZE = 4000;

/**
 * Converts a ChartSection to Word paragraphs with embedded image.
 * The imageData should already be a base64 PNG string from rasterization.
 */
export async function convertChart(
  section: ChartSection
): Promise<Paragraph[]> {
  if (!section.imageData) {
    return [];
  }

  const paragraphs: Paragraph[] = [];

  // Add title if provided
  if (section.title) {
    paragraphs.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun({ text: section.title, bold: true })],
      })
    );
  }

  // Convert base64 to Uint8Array
  const imageData = base64ToUint8Array(section.imageData);

  // Add the chart image
  paragraphs.push(
    new Paragraph({
      children: [
        new ImageRun({
          data: imageData,
          transformation: {
            width: section.width || DEFAULT_CHART_WIDTH,
            height: section.height || DEFAULT_CHART_HEIGHT,
          },
        }),
      ],
    })
  );

  return paragraphs;
}

/**
 * Rasterizes an SVG element to a PNG base64 data URL.
 * Uses Canvg for SVG-to-canvas conversion, following the pattern from ReportExportMenu.
 *
 * @param svgElement - The SVG element to rasterize
 * @param options - Optional configuration for width, height, and quality
 * @returns Promise<string> - Base64 PNG data URL
 */
export async function rasterizeSvgToBase64(
  svgElement: SVGElement,
  options?: {
    maxSize?: number;
    quality?: number;
  }
): Promise<string> {
  try {
    const maxSize = options?.maxSize || RASTERIZATION_MAX_SIZE;

    // Clone the SVG to avoid modifying the original
    const copy = svgElement.cloneNode(true) as SVGElement;

    // Get original dimensions
    const width = svgElement.clientWidth || 800;
    const height = svgElement.clientHeight || 600;
    const aspectRatio = width / height;

    // Calculate new dimensions for high resolution
    const newWidth = aspectRatio > 1 ? maxSize : aspectRatio * maxSize;
    const newHeight = aspectRatio <= 1 ? maxSize : (1 / aspectRatio) * maxSize;

    // Set new dimensions on the SVG
    copy.setAttribute('width', String(newWidth));
    copy.setAttribute('height', String(newHeight));

    // Serialize SVG to string
    const svgContent = new XMLSerializer().serializeToString(copy);

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Fill with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, newWidth, newHeight);

    // Render SVG to canvas using Canvg
    const v = await Canvg.fromString(ctx, svgContent);
    await v.render();

    // Convert to PNG data URL
    return canvas.toDataURL('image/png', options?.quality || 0.92);
  } catch (error) {
    console.error('Failed to rasterize SVG:', error);
    throw new WordExportError(
      'Failed to rasterize chart',
      WordExportErrorCode.CHART_RASTERIZATION_FAILED,
      error
    );
  }
}

/**
 * Rasterizes multiple SVG elements in batch.
 *
 * @param svgElements - Map of element ID to SVG element
 * @returns Promise<Map<string, string>> - Map of element ID to base64 PNG
 */
export async function rasterizeChartsBatch(
  svgElements: Map<string, SVGElement>
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  for (const [id, element] of svgElements) {
    try {
      const base64 = await rasterizeSvgToBase64(element);
      results.set(id, base64);
    } catch (error) {
      console.error(`Failed to rasterize chart ${id}:`, error);
      // Continue with other charts, don't fail the whole batch
    }
  }

  return results;
}

/**
 * Gets the SVG element from a Recharts container ref.
 * Recharts wraps SVGs in a container element.
 *
 * @param containerRef - React ref to the Recharts ResponsiveContainer
 * @returns SVGElement | null
 */
export function getSvgFromRechartsRef(
  containerRef: React.RefObject<any>
): SVGElement | null {
  if (!containerRef.current) {
    return null;
  }

  // Recharts structure: container -> children[0] is usually the SVG
  // or we can query for the SVG element
  const container = containerRef.current.container || containerRef.current;

  if (container instanceof SVGElement) {
    return container;
  }

  // Try to find SVG child
  const svg = container.querySelector?.('svg');
  return svg || null;
}

/**
 * Rasterizes an HTML element to a PNG base64 data URL using html2canvas.
 * Useful for capturing styled div-based charts (like ComparisonBarChart).
 *
 * @param element - The HTML element to capture
 * @param options - Optional configuration for scale and quality
 * @returns Promise<string> - Base64 PNG data URL
 */
export async function rasterizeHtmlToBase64(
  element: HTMLElement,
  options?: {
    scale?: number;
    backgroundColor?: string;
  }
): Promise<string> {
  try {
    // Lazy load html2canvas to reduce initial bundle size
    const html2canvas = (await import('html2canvas')).default;

    const scale = options?.scale || 2;
    const backgroundColor = options?.backgroundColor || '#ffffff';

    const canvas = await html2canvas(element, {
      scale,
      backgroundColor,
      useCORS: true,
      logging: false,
      allowTaint: true,
    });

    return canvas.toDataURL('image/png', 0.92);
  } catch (error) {
    console.error('Failed to rasterize HTML element:', error);
    throw new WordExportError(
      'Failed to rasterize HTML element',
      WordExportErrorCode.CHART_RASTERIZATION_FAILED,
      error
    );
  }
}
