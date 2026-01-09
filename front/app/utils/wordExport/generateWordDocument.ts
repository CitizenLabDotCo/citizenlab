import {
  Document,
  Packer,
  Paragraph,
  Table,
  TextRun,
  HeadingLevel,
} from 'docx';
import { SupportedLocale } from 'typings';

import { convertChart } from './converters/chartConverter';
import { convertImage } from './converters/imageConverter';
import { convertLayout } from './converters/layoutConverter';
import { convertTable } from './converters/tableConverter';
import { convertText } from './converters/textConverter';
import {
  WordExportDocument,
  WordExportSection,
  WordExportError,
  WordExportErrorCode,
} from './types';

export interface GenerateWordDocumentOptions {
  locale: SupportedLocale;
}

/**
 * Generates a Word document (.docx) from a WordExportDocument.
 * Returns a Blob that can be saved using file-saver.
 *
 * @param document - The document structure to convert
 * @param options - Generation options including locale
 * @returns Promise<Blob> - The generated Word document as a Blob
 */
export async function generateWordDocument(
  document: WordExportDocument,
  _options: GenerateWordDocumentOptions
): Promise<Blob> {
  try {
    // Convert all sections to Word elements
    const children = await convertSections(document.sections);

    // Add title as first element if provided
    const titleElements: Paragraph[] = document.title
      ? [
          new Paragraph({
            heading: HeadingLevel.TITLE,
            children: [new TextRun({ text: document.title, bold: true })],
          }),
          new Paragraph({ children: [] }), // Spacer
        ]
      : [];

    // Create the document
    const doc = new Document({
      creator: document.metadata?.author || 'Go Vocal',
      title: document.title,
      description: document.metadata?.description,
      styles: {
        default: {
          document: {
            run: {
              font: 'Arial',
              size: 24, // 12pt (size is in half-points)
            },
          },
          heading1: {
            run: {
              font: 'Arial',
              size: 48, // 24pt
              bold: true,
              color: '333333',
            },
            paragraph: {
              spacing: { before: 240, after: 120 },
            },
          },
          heading2: {
            run: {
              font: 'Arial',
              size: 36, // 18pt
              bold: true,
              color: '333333',
            },
            paragraph: {
              spacing: { before: 200, after: 100 },
            },
          },
          heading3: {
            run: {
              font: 'Arial',
              size: 28, // 14pt
              bold: true,
              color: '333333',
            },
            paragraph: {
              spacing: { before: 160, after: 80 },
            },
          },
          heading4: {
            run: {
              font: 'Arial',
              size: 24, // 12pt
              bold: true,
              color: '333333',
            },
            paragraph: {
              spacing: { before: 120, after: 60 },
            },
          },
        },
      },
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch (in twips)
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: [...titleElements, ...children],
        },
      ],
    });

    // Convert to blob
    return Packer.toBlob(doc);
  } catch (error) {
    console.error('Failed to generate Word document:', error);
    throw new WordExportError(
      'Failed to generate Word document',
      WordExportErrorCode.DOCUMENT_GENERATION_FAILED,
      error
    );
  }
}

/**
 * Converts an array of sections to Word elements.
 */
async function convertSections(
  sections: WordExportSection[]
): Promise<(Paragraph | Table)[]> {
  const results: (Paragraph | Table)[] = [];

  for (const section of sections) {
    const converted = await convertSection(section);
    results.push(...converted);
  }

  return results;
}

/**
 * Converts a single section to Word elements.
 */
async function convertSection(
  section: WordExportSection
): Promise<(Paragraph | Table)[]> {
  try {
    switch (section.type) {
      case 'text':
        return convertText(section);

      case 'image':
        return convertImage(section);

      case 'chart':
        return convertChart(section);

      case 'table':
        return convertTable(section);

      case 'layout':
        return convertLayout(section);

      case 'whitespace':
        return convertWhitespace(section.size);

      default:
        console.warn(`Unknown section type: ${(section as any).type}`);
        return [];
    }
  } catch (error) {
    console.error(`Failed to convert section:`, section, error);
    // Return placeholder on error instead of failing the whole document
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: '[Content could not be exported]',
            italics: true,
            color: '999999',
          }),
        ],
      }),
    ];
  }
}

/**
 * Converts whitespace size to empty paragraphs with spacing.
 */
function convertWhitespace(size: 'small' | 'medium' | 'large'): Paragraph[] {
  const spacingMap = {
    small: 100,
    medium: 200,
    large: 400,
  };

  return [
    new Paragraph({
      children: [],
      spacing: { before: spacingMap[size], after: spacingMap[size] },
    }),
  ];
}
