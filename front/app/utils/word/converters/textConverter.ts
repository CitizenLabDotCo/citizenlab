import { Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

import {
  TEXT_STYLES,
  WORD_SPACING,
  WORD_COLORS,
  WORD_FONT_SIZES,
  WORD_FONTS,
} from '../utils/styleConstants';

import type { FormattedText } from './types';

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
 * Creates a paragraph with multiple text runs (for mixed formatting).
 */
export function createFormattedParagraph(
  segments: FormattedText[],
  options: {
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

  const children = segments.map(
    (segment) =>
      new TextRun({
        text: segment.text,
        font: WORD_FONTS.body,
        size: segment.size || WORD_FONT_SIZES.body,
        color: segment.color || WORD_COLORS.textPrimary,
        bold: segment.bold,
        italics: segment.italic,
      })
  );

  return new Paragraph({
    children,
    alignment: options.alignment ? alignmentMap[options.alignment] : undefined,
    spacing: {
      before: options.spacing?.before ?? WORD_SPACING.paragraphBefore,
      after: options.spacing?.after ?? WORD_SPACING.paragraphAfter,
    },
  });
}

/**
 * Creates a secondary/caption text paragraph.
 */
export function createCaption(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        ...TEXT_STYLES.caption,
      }),
    ],
    spacing: {
      before: WORD_SPACING.paragraphBefore,
      after: WORD_SPACING.paragraphAfter,
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

/**
 * Creates a bullet point list.
 */
export function createBulletList(items: string[]): Paragraph[] {
  return items.map(
    (item) =>
      new Paragraph({
        children: [
          new TextRun({
            text: item,
            font: WORD_FONTS.body,
            size: WORD_FONT_SIZES.body,
            color: WORD_COLORS.textPrimary,
          }),
        ],
        bullet: {
          level: 0,
        },
        spacing: {
          before: 40,
          after: 40,
        },
      })
  );
}

/**
 * Creates a numbered list.
 */
export function createNumberedList(items: string[]): Paragraph[] {
  return items.map(
    (item, index) =>
      new Paragraph({
        children: [
          new TextRun({
            text: `${index + 1}. ${item}`,
            font: WORD_FONTS.body,
            size: WORD_FONT_SIZES.body,
            color: WORD_COLORS.textPrimary,
          }),
        ],
        spacing: {
          before: 40,
          after: 40,
        },
      })
  );
}

/**
 * Creates a section with title and content paragraphs.
 */
export function createSection(
  title: string,
  content: string | string[],
  headingLevel: 1 | 2 | 3 = 2
): Paragraph[] {
  const contentArray = Array.isArray(content) ? content : [content];

  return [
    createHeading(title, headingLevel),
    ...contentArray.map((text) => createParagraph(text)),
  ];
}
