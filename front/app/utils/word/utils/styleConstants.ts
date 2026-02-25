import { colors } from '@citizenlab/cl2-component-library';
import { convertInchesToTwip } from 'docx';

// Word document styling constants
// Designed for reuse across insights export and report builder

// Helper to strip # from hex colors (Word requires colors without #)
const stripHash = (color: string) => color.replace('#', '');

export const WORD_COLORS = {
  primary: stripHash(colors.primary),
  secondary: stripHash(colors.coolGrey600),
  accent: stripHash(colors.teal400),
  success: stripHash(colors.success),
  error: stripHash(colors.error),
  warning: stripHash(colors.orange500),
  border: stripHash(colors.divider),
  background: stripHash(colors.grey100),
  white: stripHash(colors.white),
  black: stripHash(colors.black),
  textPrimary: stripHash(colors.textPrimary),
  textSecondary: stripHash(colors.textSecondary),
};

export const WORD_FONTS = {
  heading: 'Arial',
  body: 'Arial',
};

// Font sizes in half-points (Word uses half-points, so 24 = 12pt)
export const WORD_FONT_SIZES = {
  title: 48, // 24pt
  heading1: 40, // 20pt
  heading2: 32, // 16pt
  heading3: 28, // 14pt
  body: 22, // 11pt
  small: 18, // 9pt
  caption: 16, // 8pt
};

// Page margins in twips (1 inch = 1440 twips)
export const WORD_MARGINS = {
  top: convertInchesToTwip(1),
  right: convertInchesToTwip(1),
  bottom: convertInchesToTwip(1),
  left: convertInchesToTwip(1),
};

// A4 page size in twips
export const WORD_PAGE_SIZE = {
  width: 11906, // 210mm in twips
  height: 16838, // 297mm in twips
};

// Standard spacing values in twips
export const WORD_SPACING = {
  paragraphAfter: 200, // ~14pt after paragraphs
  paragraphBefore: 100, // ~7pt before paragraphs
  lineSpacing: 276, // 1.15 line spacing
  sectionGap: 400, // Gap between major sections
};

// Table styling
export const WORD_TABLE_STYLES = {
  headerBackground: WORD_COLORS.primary,
  headerTextColor: WORD_COLORS.white,
  rowBackground: WORD_COLORS.white,
  alternateRowBackground: WORD_COLORS.background,
  borderColor: WORD_COLORS.border,
  borderSize: 1, // in points
  cellPadding: {
    top: 80,
    bottom: 80,
    left: 120,
    right: 120,
  },
};

export const MAX_IMAGE_WIDTH = 600;
const DEFAULT_IMAGE_HEIGHT_RATIO = 0.6;

export const getScaledDimensions = (width: number, height: number) => {
  if (width <= 0 || height <= 0) {
    return {
      width: MAX_IMAGE_WIDTH,
      height: Math.round(MAX_IMAGE_WIDTH * DEFAULT_IMAGE_HEIGHT_RATIO),
    };
  }
  const scale = Math.min(1, MAX_IMAGE_WIDTH / width);
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
};

export type SpacerSize = 'small' | 'medium' | 'large';

export const getSpacerSpacing = (size?: SpacerSize) => {
  switch (size) {
    case 'large':
      return 600;
    case 'medium':
      return 400;
    case 'small':
    default:
      return 200;
  }
};

// Common text run styles
export const TEXT_STYLES = {
  title: {
    font: WORD_FONTS.heading,
    size: WORD_FONT_SIZES.title,
    bold: true,
    color: WORD_COLORS.textPrimary,
  },
  heading1: {
    font: WORD_FONTS.heading,
    size: WORD_FONT_SIZES.heading1,
    bold: true,
    color: WORD_COLORS.textPrimary,
  },
  heading2: {
    font: WORD_FONTS.heading,
    size: WORD_FONT_SIZES.heading2,
    bold: true,
    color: WORD_COLORS.textPrimary,
  },
  heading3: {
    font: WORD_FONTS.heading,
    size: WORD_FONT_SIZES.heading3,
    bold: true,
    color: WORD_COLORS.textPrimary,
  },
  body: {
    font: WORD_FONTS.body,
    size: WORD_FONT_SIZES.body,
    color: WORD_COLORS.textPrimary,
  },
  bodySecondary: {
    font: WORD_FONTS.body,
    size: WORD_FONT_SIZES.body,
    color: WORD_COLORS.textSecondary,
  },
  caption: {
    font: WORD_FONTS.body,
    size: WORD_FONT_SIZES.caption,
    color: WORD_COLORS.textSecondary,
    italics: true,
  },
};
