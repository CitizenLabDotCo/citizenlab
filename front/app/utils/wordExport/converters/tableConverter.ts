import {
  Table,
  TableRow,
  TableCell,
  Paragraph,
  TextRun,
  WidthType,
  BorderStyle,
  AlignmentType,
} from 'docx';

import { TableSection } from '../types';

// Default table styling
const HEADER_BACKGROUND = 'E8E8E8'; // Light gray
const BORDER_COLOR = 'CCCCCC';

/**
 * Converts a TableSection to Word Table element.
 * Tables are rendered as native Word tables, fully editable.
 */
export function convertTable(section: TableSection): Table[] {
  if (!section.headers.length && !section.rows.length) {
    return [];
  }

  const columnCount = Math.max(
    section.headers.length,
    section.rows[0]?.length || 0
  );

  // Calculate column widths (equal distribution)
  const columnWidth = Math.floor(100 / columnCount);

  // Create header row
  const headerRow = new TableRow({
    tableHeader: true,
    children: section.headers.map(
      (header) =>
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: header,
                  bold: section.headerStyle?.bold !== false,
                  color: section.headerStyle?.textColor?.replace('#', ''),
                }),
              ],
            }),
          ],
          shading: {
            fill:
              section.headerStyle?.backgroundColor?.replace('#', '') ||
              HEADER_BACKGROUND,
          },
          width: {
            size: columnWidth,
            type: WidthType.PERCENTAGE,
          },
        })
    ),
  });

  // Create data rows
  const dataRows = section.rows.map(
    (row) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: cell,
                      color: section.cellStyle?.textColor?.replace('#', ''),
                      bold: section.cellStyle?.bold,
                    }),
                  ],
                }),
              ],
              shading: section.cellStyle?.backgroundColor
                ? { fill: section.cellStyle.backgroundColor.replace('#', '') }
                : undefined,
              width: {
                size: columnWidth,
                type: WidthType.PERCENTAGE,
              },
            })
        ),
      })
  );

  // Create table with borders
  const table = new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [headerRow, ...dataRows],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
      left: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
      right: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
      insideHorizontal: {
        style: BorderStyle.SINGLE,
        size: 1,
        color: BORDER_COLOR,
      },
      insideVertical: {
        style: BorderStyle.SINGLE,
        size: 1,
        color: BORDER_COLOR,
      },
    },
  });

  return [table];
}

/**
 * Creates a simple key-value table from an object.
 * Useful for metrics display.
 */
export function convertKeyValueTable(
  data: Record<string, string | number>,
  options?: {
    keyHeader?: string;
    valueHeader?: string;
  }
): Table[] {
  const section: TableSection = {
    type: 'table',
    headers: [
      options?.keyHeader || 'Property',
      options?.valueHeader || 'Value',
    ],
    rows: Object.entries(data).map(([key, value]) => [key, String(value)]),
  };

  return convertTable(section);
}
