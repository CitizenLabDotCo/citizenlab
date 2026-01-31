import {
  Table,
  TableRow,
  TableCell,
  Paragraph,
  TextRun,
  WidthType,
  BorderStyle,
  VerticalAlign,
  AlignmentType,
} from 'docx';

import {
  WORD_TABLE_STYLES,
  WORD_FONTS,
  WORD_FONT_SIZES,
  WORD_COLORS,
} from '../utils/styleConstants';

import type { CellContent, TableRowData } from './types';

interface TableOptions {
  columnWidths?: number[]; // Percentages that should sum to 100
  headerRow?: boolean;
  alternateRowColors?: boolean;
  borderColor?: string;
  headerBackground?: string;
}

/**
 * Creates a styled table from row data.
 */
export function createTable(
  rows: TableRowData[],
  options: TableOptions = {}
): Table {
  const {
    columnWidths,
    headerRow = true,
    alternateRowColors = true,
    borderColor = WORD_TABLE_STYLES.borderColor,
    headerBackground = WORD_TABLE_STYLES.headerBackground,
  } = options;

  const tableRows = rows.map((row, rowIndex) => {
    const isHeader = row.isHeader ?? (headerRow && rowIndex === 0);
    const isAlternate = !isHeader && alternateRowColors && rowIndex % 2 === 1;

    const backgroundColor = isHeader
      ? headerBackground
      : isAlternate
      ? WORD_TABLE_STYLES.alternateRowBackground
      : WORD_TABLE_STYLES.rowBackground;

    const textColor = isHeader
      ? WORD_TABLE_STYLES.headerTextColor
      : WORD_COLORS.textPrimary;

    return new TableRow({
      children: row.cells.map((cellContent, cellIndex) =>
        createTableCell(cellContent, {
          backgroundColor,
          textColor,
          bold: isHeader,
          width: columnWidths?.[cellIndex],
          borderColor,
        })
      ),
    });
  });

  return new Table({
    rows: tableRows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
  });
}

/**
 * Creates a simple table from a 2D array of strings.
 */
export function createSimpleTable(
  data: CellContent[][],
  options: TableOptions = {}
): Table {
  const rows: TableRowData[] = data.map((rowData, index) => ({
    cells: rowData,
    isHeader: options.headerRow !== false && index === 0,
  }));

  return createTable(rows, options);
}

interface CellOptions {
  backgroundColor?: string;
  textColor?: string;
  bold?: boolean;
  width?: number; // Percentage
  borderColor?: string;
  alignment?: 'left' | 'center' | 'right';
}

/**
 * Creates a single table cell with content.
 */
export function createTableCell(
  content: CellContent,
  options: CellOptions = {}
): TableCell {
  const {
    backgroundColor = WORD_TABLE_STYLES.rowBackground,
    textColor = WORD_COLORS.textPrimary,
    bold = false,
    width,
    borderColor = WORD_TABLE_STYLES.borderColor,
    alignment = 'left',
  } = options;

  const alignmentMap = {
    left: AlignmentType.LEFT,
    center: AlignmentType.CENTER,
    right: AlignmentType.RIGHT,
  };

  const displayContent = content?.toString() ?? '';

  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: displayContent,
            font: WORD_FONTS.body,
            size: WORD_FONT_SIZES.body,
            color: textColor,
            bold,
          }),
        ],
        alignment: alignmentMap[alignment],
      }),
    ],
    shading: {
      fill: backgroundColor,
    },
    margins: WORD_TABLE_STYLES.cellPadding,
    verticalAlign: VerticalAlign.CENTER,
    width: width
      ? {
          size: width,
          type: WidthType.PERCENTAGE,
        }
      : undefined,
    borders: {
      top: {
        style: BorderStyle.SINGLE,
        size: WORD_TABLE_STYLES.borderSize,
        color: borderColor,
      },
      bottom: {
        style: BorderStyle.SINGLE,
        size: WORD_TABLE_STYLES.borderSize,
        color: borderColor,
      },
      left: {
        style: BorderStyle.SINGLE,
        size: WORD_TABLE_STYLES.borderSize,
        color: borderColor,
      },
      right: {
        style: BorderStyle.SINGLE,
        size: WORD_TABLE_STYLES.borderSize,
        color: borderColor,
      },
    },
  });
}
