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
  WORD_SPACING,
} from '../utils/styleConstants';

import { createHeading } from './textConverter';

import type { BreakdownItem } from './types';

interface BreakdownTableOptions {
  title?: string;
  showPercentage?: boolean;
  showCount?: boolean;
  maxItems?: number;
  defaultBarColor?: string;
}

/**
 * Creates a breakdown table with visual bars for topics, statuses, etc.
 * The visual bar effect is achieved using table cell shading.
 */
export function createBreakdownTable(
  items: BreakdownItem[],
  options: BreakdownTableOptions = {}
): (Paragraph | Table)[] {
  const {
    title,
    showPercentage = true,
    showCount = true,
    maxItems,
    defaultBarColor = WORD_COLORS.primary,
  } = options;

  // Limit items if specified
  const displayItems = maxItems ? items.slice(0, maxItems) : items;

  if (displayItems.length === 0) {
    return [];
  }

  // Calculate max count for percentage calculation
  const maxCount = Math.max(...displayItems.map((item) => item.count), 1);

  // Build table rows
  const rows: TableRow[] = [];

  // Header row
  const headerCells: string[] = ['Name'];
  if (showCount) headerCells.push('Count');
  if (showPercentage) headerCells.push('Distribution');

  rows.push(createHeaderRow(headerCells));

  // Data rows
  displayItems.forEach((item) => {
    const percentage = item.percentage ?? (item.count / maxCount) * 100;
    const barColor = item.color?.replace('#', '') || defaultBarColor;

    rows.push(
      createBreakdownRow(item, {
        percentage,
        barColor,
        showCount,
        showPercentage,
      })
    );
  });

  const result: (Paragraph | Table)[] = [];

  if (title) {
    result.push(createHeading(title, 3));
  }

  result.push(
    new Table({
      rows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
    })
  );

  return result;
}

function createHeaderRow(headers: string[]): TableRow {
  return new TableRow({
    children: headers.map(
      (header) =>
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: header,
                  font: WORD_FONTS.body,
                  size: WORD_FONT_SIZES.body,
                  color: WORD_TABLE_STYLES.headerTextColor,
                  bold: true,
                }),
              ],
            }),
          ],
          shading: {
            fill: WORD_TABLE_STYLES.headerBackground,
          },
          margins: WORD_TABLE_STYLES.cellPadding,
          verticalAlign: VerticalAlign.CENTER,
          borders: createCellBorders(),
        })
    ),
  });
}

function createBreakdownRow(
  item: BreakdownItem,
  options: {
    percentage: number;
    barColor: string;
    showCount: boolean;
    showPercentage: boolean;
  }
): TableRow {
  const { percentage, barColor, showCount, showPercentage } = options;

  const cells: TableCell[] = [];

  // Name cell
  cells.push(
    new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: item.name,
              font: WORD_FONTS.body,
              size: WORD_FONT_SIZES.body,
              color: WORD_COLORS.textPrimary,
            }),
          ],
        }),
      ],
      margins: WORD_TABLE_STYLES.cellPadding,
      verticalAlign: VerticalAlign.CENTER,
      borders: createCellBorders(),
      width: {
        size: showPercentage ? 35 : 60,
        type: WidthType.PERCENTAGE,
      },
    })
  );

  // Count cell
  if (showCount) {
    cells.push(
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: item.count.toString(),
                font: WORD_FONTS.body,
                size: WORD_FONT_SIZES.body,
                color: WORD_COLORS.textPrimary,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
        margins: WORD_TABLE_STYLES.cellPadding,
        verticalAlign: VerticalAlign.CENTER,
        borders: createCellBorders(),
        width: {
          size: 15,
          type: WidthType.PERCENTAGE,
        },
      })
    );
  }

  // Distribution/bar cell
  if (showPercentage) {
    cells.push(createBarCell(percentage, barColor));
  }

  return new TableRow({
    children: cells,
  });
}

/**
 * Creates a cell with a visual bar representation.
 * Uses a nested table with two cells - one colored (the bar) and one white.
 */
function createBarCell(percentage: number, barColor: string): TableCell {
  const barWidth = Math.max(Math.round(percentage), 1);
  const emptyWidth = 100 - barWidth;

  // Create a visual bar using text with background
  // We'll use percentage text with shaded background
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: `${Math.round(percentage)}%`,
            font: WORD_FONTS.body,
            size: WORD_FONT_SIZES.small,
            color: WORD_COLORS.textSecondary,
          }),
        ],
        alignment: AlignmentType.LEFT,
      }),
      // Visual bar representation using a nested table
      new Table({
        rows: [
          new TableRow({
            children: [
              // Filled bar portion
              new TableCell({
                children: [
                  new Paragraph({
                    children: [],
                  }),
                ],
                shading: {
                  fill: barColor,
                },
                width: {
                  size: barWidth,
                  type: WidthType.PERCENTAGE,
                },
                borders: {
                  top: { style: BorderStyle.NIL },
                  bottom: { style: BorderStyle.NIL },
                  left: { style: BorderStyle.NIL },
                  right: { style: BorderStyle.NIL },
                },
              }),
              // Empty bar portion
              new TableCell({
                children: [
                  new Paragraph({
                    children: [],
                  }),
                ],
                shading: {
                  fill: WORD_COLORS.background,
                },
                width: {
                  size: emptyWidth,
                  type: WidthType.PERCENTAGE,
                },
                borders: {
                  top: { style: BorderStyle.NIL },
                  bottom: { style: BorderStyle.NIL },
                  left: { style: BorderStyle.NIL },
                  right: { style: BorderStyle.NIL },
                },
              }),
            ],
            height: {
              value: 200, // Fixed height in twips for the bar
              rule: 'exact' as const,
            },
          }),
        ],
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
      }),
    ],
    margins: WORD_TABLE_STYLES.cellPadding,
    verticalAlign: VerticalAlign.CENTER,
    borders: createCellBorders(),
    width: {
      size: 50,
      type: WidthType.PERCENTAGE,
    },
  });
}

function createCellBorders() {
  return {
    top: {
      style: BorderStyle.SINGLE,
      size: WORD_TABLE_STYLES.borderSize,
      color: WORD_TABLE_STYLES.borderColor,
    },
    bottom: {
      style: BorderStyle.SINGLE,
      size: WORD_TABLE_STYLES.borderSize,
      color: WORD_TABLE_STYLES.borderColor,
    },
    left: {
      style: BorderStyle.SINGLE,
      size: WORD_TABLE_STYLES.borderSize,
      color: WORD_TABLE_STYLES.borderColor,
    },
    right: {
      style: BorderStyle.SINGLE,
      size: WORD_TABLE_STYLES.borderSize,
      color: WORD_TABLE_STYLES.borderColor,
    },
  };
}

/**
 * Creates a simple list-style breakdown without visual bars.
 * Useful for simpler representations.
 */
export function createSimpleBreakdownList(
  items: BreakdownItem[],
  options: { title?: string; maxItems?: number } = {}
): Paragraph[] {
  const { title, maxItems } = options;
  const displayItems = maxItems ? items.slice(0, maxItems) : items;

  const result: Paragraph[] = [];

  if (title) {
    result.push(createHeading(title, 3));
  }

  displayItems.forEach((item) => {
    result.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${item.name}: `,
            font: WORD_FONTS.body,
            size: WORD_FONT_SIZES.body,
            color: WORD_COLORS.textPrimary,
            bold: true,
          }),
          new TextRun({
            text: `${item.count}`,
            font: WORD_FONTS.body,
            size: WORD_FONT_SIZES.body,
            color: WORD_COLORS.textSecondary,
          }),
          ...(item.percentage !== undefined
            ? [
                new TextRun({
                  text: ` (${Math.round(item.percentage)}%)`,
                  font: WORD_FONTS.body,
                  size: WORD_FONT_SIZES.body,
                  color: WORD_COLORS.textSecondary,
                }),
              ]
            : []),
        ],
        spacing: {
          before: WORD_SPACING.paragraphBefore / 2,
          after: WORD_SPACING.paragraphAfter / 2,
        },
      })
    );
  });

  return result;
}
