import { SupportedLocale } from 'typings';

/**
 * Intermediate document representation for Word export.
 * This format decouples content sources (React components, CraftJS JSON)
 * from the actual Word document generation.
 */
export interface WordExportDocument {
  title: string;
  metadata?: WordDocumentMetadata;
  sections: WordExportSection[];
}

export interface WordDocumentMetadata {
  author?: string;
  description?: string;
  createdAt?: Date;
  locale?: SupportedLocale;
}

/**
 * Union type for all possible section types in a Word document.
 */
export type WordExportSection =
  | TextSection
  | ImageSection
  | ChartSection
  | TableSection
  | LayoutSection
  | WhiteSpaceSection;

interface BaseSection {
  id?: string;
}

/**
 * Text content section - rendered as Word paragraphs with formatting.
 * Content can be HTML (from Quill editor) or plain text.
 */
export interface TextSection extends BaseSection {
  type: 'text';
  content: string; // HTML or plain text content
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'paragraph';
}

/**
 * Image section - embedded as inline image in Word document.
 * Images are downloaded and converted to base64 for embedding.
 */
export interface ImageSection extends BaseSection {
  type: 'image';
  src: string; // URL or base64 data URL
  alt?: string;
  width?: number; // in pixels
  height?: number; // in pixels
}

/**
 * Chart section - rasterized chart as PNG image.
 * Charts are converted from SVG to PNG at high resolution.
 */
export interface ChartSection extends BaseSection {
  type: 'chart';
  imageData: string; // base64 PNG data URL
  title?: string;
  width?: number; // in pixels
  height?: number; // in pixels
}

/**
 * Table section - rendered as native Word table.
 * Tables are fully editable in Word.
 */
export interface TableSection extends BaseSection {
  type: 'table';
  headers: string[];
  rows: string[][];
  headerStyle?: TableCellStyle;
  cellStyle?: TableCellStyle;
}

export interface TableCellStyle {
  backgroundColor?: string;
  textColor?: string;
  bold?: boolean;
}

/**
 * Layout section - for multi-column layouts (like TwoColumn widget).
 * Rendered using Word's column feature.
 */
export interface LayoutSection extends BaseSection {
  type: 'layout';
  columns: WordExportSection[][]; // Array of columns, each containing sections
  columnWidths?: number[]; // Proportional widths (e.g., [1, 2] for 1:2 ratio)
}

/**
 * Whitespace section - vertical spacing between content.
 */
export interface WhiteSpaceSection extends BaseSection {
  type: 'whitespace';
  size: 'small' | 'medium' | 'large';
}

/**
 * Options for content collectors.
 */
export interface ContentCollectorOptions {
  locale: SupportedLocale;
  phaseId?: string;
  projectId?: string;
}

/**
 * Options for chart rasterization.
 */
export interface ChartRasterizationOptions {
  width?: number; // Max width in pixels, default: 4000
  quality?: number; // 0-1, default: 0.92
  format?: 'png' | 'jpeg';
}

/**
 * Error codes for Word export failures.
 */
export enum WordExportErrorCode {
  CHART_RASTERIZATION_FAILED = 'CHART_RASTERIZATION_FAILED',
  IMAGE_LOAD_FAILED = 'IMAGE_LOAD_FAILED',
  DOCUMENT_GENERATION_FAILED = 'DOCUMENT_GENERATION_FAILED',
  INVALID_CONTENT = 'INVALID_CONTENT',
}

/**
 * Custom error class for Word export failures.
 */
export class WordExportError extends Error {
  constructor(
    message: string,
    public readonly code: WordExportErrorCode,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'WordExportError';
  }
}
