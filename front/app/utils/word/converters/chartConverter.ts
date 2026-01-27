import { Paragraph, ImageRun, AlignmentType, TextRun } from 'docx';

import {
  WORD_IMAGE_DIMENSIONS,
  WORD_SPACING,
  WORD_FONTS,
  WORD_FONT_SIZES,
  WORD_COLORS,
} from '../utils/styleConstants';
import {
  svgToImageBuffer,
  calculateScaledDimensions,
} from '../utils/svgToImage';

import { createCaption, createEmptyParagraph } from './textConverter';

interface ChartToImageOptions {
  maxWidth?: number; // In twips
  maxHeight?: number; // In twips
  scale?: number;
  caption?: string;
  alignment?: 'left' | 'center' | 'right';
}

/**
 * Converts an SVG chart element to a Word paragraph containing an image.
 * Returns null if the SVG element is not available.
 */
export async function createChartImage(
  svgElement: SVGElement | null,
  options: ChartToImageOptions = {}
): Promise<Paragraph[]> {
  if (!svgElement) {
    return [];
  }

  const {
    maxWidth = WORD_IMAGE_DIMENSIONS.fullWidth,
    maxHeight = WORD_IMAGE_DIMENSIONS.chartHeight,
    scale = 2,
    caption,
    alignment = 'center',
  } = options;

  try {
    // Get original dimensions
    const originalWidth = svgElement.clientWidth || 800;
    const originalHeight = svgElement.clientHeight || 400;

    // Calculate scaled dimensions for the image in the document
    // Convert from twips to pixels for display (1 inch = 1440 twips, 96 pixels)
    const maxWidthPx = (maxWidth / 1440) * 96;
    const maxHeightPx = (maxHeight / 1440) * 96;

    const { width, height } = calculateScaledDimensions(
      originalWidth,
      originalHeight,
      maxWidthPx,
      maxHeightPx
    );

    // Convert SVG to image buffer at higher resolution for quality
    const imageBuffer = await svgToImageBuffer(svgElement, {
      width: width * scale,
      height: height * scale,
      scale,
    });

    const alignmentMap = {
      left: AlignmentType.LEFT,
      center: AlignmentType.CENTER,
      right: AlignmentType.RIGHT,
    };

    const result: Paragraph[] = [
      new Paragraph({
        children: [
          new ImageRun({
            data: imageBuffer,
            transformation: {
              width,
              height,
            },
            type: 'png',
          }),
        ],
        alignment: alignmentMap[alignment],
        spacing: {
          before: WORD_SPACING.paragraphBefore,
          after: caption ? 0 : WORD_SPACING.paragraphAfter,
        },
      }),
    ];

    if (caption) {
      result.push(createCaption(caption));
    }

    return result;
  } catch (error) {
    console.error('Failed to convert chart to image:', error);
    // Return empty array on failure - caller can handle gracefully
    return [];
  }
}

/**
 * Converts multiple SVG charts to Word paragraphs.
 * Useful for pages with multiple charts.
 */
export async function createMultipleChartImages(
  charts: Array<{
    svgElement: SVGElement | null;
    caption?: string;
  }>,
  options: Omit<ChartToImageOptions, 'caption'> = {}
): Promise<Paragraph[]> {
  const results: Paragraph[] = [];

  for (const chart of charts) {
    const chartParagraphs = await createChartImage(chart.svgElement, {
      ...options,
      caption: chart.caption,
    });
    results.push(...chartParagraphs);

    // Add spacing between charts
    if (chartParagraphs.length > 0) {
      results.push(createEmptyParagraph());
    }
  }

  return results;
}

/**
 * Creates a placeholder paragraph when a chart cannot be converted.
 * Useful for graceful degradation.
 */
export function createChartPlaceholder(
  message = 'Chart could not be rendered'
): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: `[${message}]`,
        font: WORD_FONTS.body,
        size: WORD_FONT_SIZES.body,
        color: WORD_COLORS.textSecondary,
        italics: true,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: {
      before: WORD_SPACING.paragraphBefore,
      after: WORD_SPACING.paragraphAfter,
    },
  });
}
