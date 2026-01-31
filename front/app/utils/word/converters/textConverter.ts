import { Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

import {
  TEXT_STYLES,
  WORD_SPACING,
  WORD_COLORS,
  WORD_FONT_SIZES,
  WORD_FONTS,
} from '../utils/styleConstants';

/**
 * Creates a document title paragraph.
 */
export function createTitle(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        ...TEXT_STYLES.title,
      }),
    ],
    heading: HeadingLevel.TITLE,
    spacing: {
      after: WORD_SPACING.sectionGap,
    },
  });
}

/**
 * Creates a heading paragraph at the specified level.
 */
export function createHeading(text: string, level: 1 | 2 | 3 = 1): Paragraph {
  const headingLevels = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
  };

  const styles = {
    1: TEXT_STYLES.heading1,
    2: TEXT_STYLES.heading2,
    3: TEXT_STYLES.heading3,
  };

  return new Paragraph({
    children: [
      new TextRun({
        text,
        ...styles[level],
      }),
    ],
    heading: headingLevels[level],
    spacing: {
      before: WORD_SPACING.sectionGap,
      after: WORD_SPACING.paragraphAfter,
    },
  });
}

/**
 * Creates a body text paragraph.
 */
export function createParagraph(
  text: string,
  options: {
    bold?: boolean;
    italic?: boolean;
    color?: string;
    alignment?: 'left' | 'center' | 'right' | 'justified';
    spacing?: { before?: number; after?: number };
  } = {}
): Paragraph {
  const alignmentMap = {
    left: AlignmentType.LEFT,
    center: AlignmentType.CENTER,
    right: AlignmentType.RIGHT,
    justified: AlignmentType.JUSTIFIED,
  };

  return new Paragraph({
    children: [
      new TextRun({
        text,
        font: WORD_FONTS.body,
        size: WORD_FONT_SIZES.body,
        color: options.color || WORD_COLORS.textPrimary,
        bold: options.bold,
        italics: options.italic,
      }),
    ],
    alignment: options.alignment ? alignmentMap[options.alignment] : undefined,
    spacing: {
      before: options.spacing?.before ?? WORD_SPACING.paragraphBefore,
      after: options.spacing?.after ?? WORD_SPACING.paragraphAfter,
    },
  });
}

/**
 * Creates an empty paragraph for spacing.
 */
export function createEmptyParagraph(height?: number): Paragraph {
  return new Paragraph({
    children: [],
    spacing: {
      after: height || WORD_SPACING.paragraphAfter,
    },
  });
}
