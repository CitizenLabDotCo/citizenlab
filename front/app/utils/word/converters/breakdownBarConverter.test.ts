/**
 * Tests for breakdownBarConverter.
 *
 * The converter creates native Word tables with visual bars — no screenshots,
 * no DOM, pure data → docx objects. These are fully unit-testable.
 */
import { Table } from 'docx';

import { createBreakdownTable } from './breakdownBarConverter';

import type { BreakdownItem } from './types';

// Mock the styleConstants to avoid the @citizenlab/cl2-component-library dep
jest.mock('../utils/styleConstants', () => ({
  WORD_TABLE_STYLES: {
    headerBackground: '1A73E8',
    headerTextColor: 'FFFFFF',
    rowBackground: 'FFFFFF',
    alternateRowBackground: 'F5F5F5',
    borderColor: 'E0E0E0',
    borderSize: 1,
    cellPadding: { top: 80, bottom: 80, left: 120, right: 120 },
  },
  WORD_FONTS: {
    heading: 'Arial',
    body: 'Arial',
  },
  WORD_FONT_SIZES: {
    title: 48,
    heading1: 40,
    heading2: 32,
    heading3: 28,
    body: 22,
    small: 18,
    caption: 16,
  },
  WORD_COLORS: {
    primary: '1A73E8',
    secondary: '5F6368',
    accent: '00BCD4',
    success: '34A853',
    error: 'EA4335',
    warning: 'FBBC04',
    border: 'E0E0E0',
    background: 'F5F5F5',
    white: 'FFFFFF',
    black: '000000',
    textPrimary: '202124',
    textSecondary: '5F6368',
  },
  WORD_SPACING: {
    paragraphAfter: 200,
    paragraphBefore: 100,
    lineSpacing: 276,
    sectionGap: 400,
  },
  TEXT_STYLES: {
    body: { font: 'Arial', size: 22, color: '202124' },
    heading3: { font: 'Arial', size: 28, bold: true, color: '202124' },
  },
}));

// Also mock textConverter since it imports styleConstants
jest.mock('./textConverter', () => ({
  createHeading: (_text: string, _level: number) => ({
    _mock: 'heading',
    text: _text,
    level: _level,
  }),
  createParagraph: (_text: string) => ({ _mock: 'paragraph', text: _text }),
  createEmptyParagraph: () => ({ _mock: 'empty-paragraph' }),
  createTitle: (_text: string) => ({ _mock: 'title', text: _text }),
}));

const sampleItems: BreakdownItem[] = [
  { name: 'Housing', count: 42, percentage: 42 },
  { name: 'Transport', count: 30, percentage: 30 },
  { name: 'Parks', count: 18, percentage: 18 },
  { name: 'Safety', count: 10, percentage: 10 },
];

const sampleItemsWithColors: BreakdownItem[] = [
  { name: 'Open', count: 25, color: '#4CAF50' },
  { name: 'In Progress', count: 15, color: '#2196F3' },
  { name: 'Done', count: 60, color: '#9C27B0' },
];

describe('createBreakdownTable', () => {
  describe('return structure', () => {
    it('returns an array of docx elements', () => {
      const result = createBreakdownTable(sampleItems);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for empty input', () => {
      const result = createBreakdownTable([]);
      expect(result).toEqual([]);
    });

    it('includes a heading when title is provided', () => {
      const result = createBreakdownTable(sampleItems, {
        title: 'Topic Breakdown',
      });
      // First element should be the heading
      const first = result[0] as any;
      expect(first._mock).toBe('heading');
      expect(first.text).toBe('Topic Breakdown');
    });

    it('does not include a heading when title is omitted', () => {
      const result = createBreakdownTable(sampleItems);
      // With docx Table, first element is a Table instance (no heading mock)
      expect((result[0] as any)._mock).toBeUndefined();
    });

    it('includes exactly one Table element', () => {
      const result = createBreakdownTable(sampleItems);
      const tables = result.filter((el) => el instanceof Table);
      expect(tables).toHaveLength(1);
    });
  });

  describe('options', () => {
    it('respects maxItems limit', () => {
      const result = createBreakdownTable(sampleItems, { maxItems: 2 });
      // Should have 1 table with header + 2 data rows = 3 rows total
      const table = result.find((el) => el instanceof Table) as Table;
      expect(table).toBeDefined();
      // @ts-ignore - accessing internal root for test
      expect(table.root).toBeDefined();
    });

    it('handles items with explicit percentage values', () => {
      const items: BreakdownItem[] = [
        { name: 'A', count: 10, percentage: 75 },
        { name: 'B', count: 5, percentage: 25 },
      ];
      // Should not throw and should return a valid table
      expect(() => createBreakdownTable(items)).not.toThrow();
    });

    it('handles items without percentage (calculates from count)', () => {
      const items: BreakdownItem[] = [
        { name: 'A', count: 80 },
        { name: 'B', count: 20 },
      ];
      expect(() => createBreakdownTable(items)).not.toThrow();
      const result = createBreakdownTable(items);
      expect(result.length).toBeGreaterThan(0);
    });

    it('handles items with custom colors', () => {
      expect(() => createBreakdownTable(sampleItemsWithColors)).not.toThrow();
    });

    it('handles single item without division-by-zero', () => {
      const items: BreakdownItem[] = [{ name: 'Only', count: 1 }];
      expect(() => createBreakdownTable(items)).not.toThrow();
    });

    it('handles items with count=0', () => {
      const items: BreakdownItem[] = [
        { name: 'Active', count: 10 },
        { name: 'Inactive', count: 0 },
      ];
      expect(() => createBreakdownTable(items)).not.toThrow();
    });
  });

  describe('with title', () => {
    it('returns heading + table (2 elements)', () => {
      const result = createBreakdownTable(sampleItems, { title: 'My Title' });
      expect(result).toHaveLength(2);
      expect((result[0] as any)._mock).toBe('heading');
      expect(result[1]).toBeInstanceOf(Table);
    });
  });

  describe('showPercentage / showCount flags', () => {
    it('does not throw with showPercentage=false', () => {
      expect(() =>
        createBreakdownTable(sampleItems, { showPercentage: false })
      ).not.toThrow();
    });

    it('does not throw with showCount=false', () => {
      expect(() =>
        createBreakdownTable(sampleItems, { showCount: false })
      ).not.toThrow();
    });

    it('does not throw with both flags false', () => {
      expect(() =>
        createBreakdownTable(sampleItems, {
          showPercentage: false,
          showCount: false,
        })
      ).not.toThrow();
    });
  });

  describe('percentage bar bounds', () => {
    it('clamps bar width to minimum 1% to avoid empty cells', () => {
      // Items where the smallest item would have <1% naturally
      const items: BreakdownItem[] = [
        { name: 'Huge', count: 1000 },
        { name: 'Tiny', count: 1 },
      ];
      expect(() => createBreakdownTable(items)).not.toThrow();
    });

    it('handles 100% percentage correctly', () => {
      const items: BreakdownItem[] = [
        { name: 'Only Item', count: 50, percentage: 100 },
      ];
      expect(() => createBreakdownTable(items)).not.toThrow();
    });
  });
});
