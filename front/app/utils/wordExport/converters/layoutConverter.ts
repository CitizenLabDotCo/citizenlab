import { Paragraph, TextRun, Table } from 'docx';

import { LayoutSection, WordExportSection } from '../types';

import { convertChart } from './chartConverter';
import { convertImage } from './imageConverter';
import { convertTable } from './tableConverter';
import { convertText } from './textConverter';

/**
 * Converts a LayoutSection (like TwoColumn) to Word content.
 *
 * Note: Word's column feature is complex to implement correctly in docx.js,
 * so we render columns sequentially with clear section dividers.
 * This provides a clean, readable output while maintaining content structure.
 */
export async function convertLayout(
  section: LayoutSection
): Promise<(Paragraph | Table)[]> {
  const result: (Paragraph | Table)[] = [];

  for (
    let columnIndex = 0;
    columnIndex < section.columns.length;
    columnIndex++
  ) {
    const column = section.columns[columnIndex];

    // Add column separator if not the first column
    if (columnIndex > 0) {
      result.push(
        new Paragraph({
          children: [new TextRun({ text: '' })],
          spacing: { before: 200, after: 200 },
        })
      );
    }

    // Convert each section in the column
    for (const childSection of column) {
      const converted = await convertSection(childSection);
      result.push(...converted);
    }
  }

  return result;
}

/**
 * Converts a single section to Word elements.
 * Internal helper for layout converter.
 */
async function convertSection(
  section: WordExportSection
): Promise<(Paragraph | Table)[]> {
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
      return [];
  }
}

/**
 * Converts whitespace size to empty paragraphs.
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
