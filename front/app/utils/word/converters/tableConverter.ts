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
  WORD_CONTENT_WIDTH,
} from '../utils/styleConstants';

import type { WordCellContent, WordTableRowData } from './types';

interface TableOptions {
  columnWidths?: number[]; // Percentages that should sum to 100
  headerRow?: boolean;
  alternateRowColors?: boolean;
  borderColor?: string;
  headerBackground?: string;
}

/**
 * Word lays a table out from its column grid, and docx defaults that grid to
 * 100 twips per column, which squeezes the table down to its text. Cell
 * percentages alone do not undo that, so the grid needs real widths.
 */
export function columnWidthsInTwips(
  columnCount: number,
  percentages?: number[]
): number[] {
  const shares =
    percentages?.length === columnCount
      ? percentages
      : Array.from({ length: columnCount }, () => 100 / columnCount);

  return shares.map((share) => Math.round((WORD_CONTENT_WIDTH * share) / 100));
}

function createTable(
  rows: WordTableRowData[],
  options: TableOptions = {}
): Table {
  const {
    columnWidths,
    headerRow = true,
    alternateRowColors = true,
    borderColor = WORD_TABLE_STYLES.borderColor,
    headerBackground = WORD_TABLE_STYLES.headerBackground,
  } = options;

  const widths = columnWidthsInTwips(
    Math.max(0, ...rows.map((row) => row.cells.length)),
    columnWidths
  );

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
          width: widths[cellIndex],
          borderColor,
        })
      ),
    });
  });

  return new Table({
    rows: tableRows,
    columnWidths: widths,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
  });
}

export function createSimpleTable(
  data: WordCellContent[][],
  options: TableOptions = {}
): Table {
  const rows: WordTableRowData[] = data.map((rowData, index) => ({
    cells: rowData,
    isHeader: options.headerRow !== false && index === 0,
  }));

  return createTable(rows, options);
}

interface CellOptions {
  backgroundColor?: string;
  textColor?: string;
  bold?: boolean;
  width?: number; // In twips
  borderColor?: string;
  alignment?: 'left' | 'center' | 'right';
}

function createTableCell(
  content: WordCellContent,
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
          type: WidthType.DXA,
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
