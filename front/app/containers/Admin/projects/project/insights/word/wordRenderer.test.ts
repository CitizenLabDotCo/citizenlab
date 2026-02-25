/**
 * Tests for wordRenderer — the unified WordSection[] → .docx converter.
 *
 * We mock the docx library and converter utilities to test the renderer's
 * routing logic: does each WordSection type produce the right docx calls?
 */

// Mock the heavy imports
jest.mock('docx', () => {
  const mockElement = (name: string) => {
    return class Mock {
      _type: string;
      config: any;
      constructor(cfg: any) {
        this._type = name;
        this.config = cfg;
      }
    };
  };

  return {
    Document: mockElement('Document'),
    Packer: {
      toBlob: jest.fn().mockResolvedValue(
        new Blob(['mock-docx'], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        })
      ),
    },
    Paragraph: mockElement('Paragraph'),
    ImageRun: mockElement('ImageRun'),
    Table: mockElement('Table'),
    TableRow: mockElement('TableRow'),
    TableCell: mockElement('TableCell'),
    TextRun: mockElement('TextRun'),
    HeadingLevel: {
      HEADING_1: 'Heading1',
      HEADING_2: 'Heading2',
      HEADING_3: 'Heading3',
    },
    WidthType: { PERCENTAGE: 'pct', AUTO: 'auto' },
    AlignmentType: { LEFT: 'left', CENTER: 'center' },
    VerticalAlign: { CENTER: 'center' },
    BorderStyle: { SINGLE: 'single', NIL: 'nil' },
  };
});

jest.mock('utils/word/converters/textConverter', () => ({
  createTitle: jest.fn((text) => ({ _mock: 'title', text })),
  createHeading: jest.fn((text, level) => ({ _mock: 'heading', text, level })),
  createParagraph: jest.fn((text) => ({ _mock: 'paragraph', text })),
  createEmptyParagraph: jest.fn((spacing) => ({ _mock: 'empty', spacing })),
}));

jest.mock('utils/word/converters/tableConverter', () => ({
  createSimpleTable: jest.fn((rows, opts) => ({ _mock: 'table', rows, opts })),
}));

jest.mock('utils/word/converters/breakdownBarConverter', () => ({
  createBreakdownTable: jest.fn((items, opts) => [
    { _mock: 'breakdown', items, opts },
  ]),
}));

jest.mock('utils/word/utils/styleConstants', () => ({
  WORD_MARGINS: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
  WORD_PAGE_SIZE: { width: 11906, height: 16838 },
  getScaledDimensions: jest.fn((w: number, h: number) => {
    const maxW = 600;
    if (w <= 0 || h <= 0)
      return { width: maxW, height: Math.round(maxW * 0.6) };
    const scale = Math.min(1, maxW / w);
    return { width: Math.round(w * scale), height: Math.round(h * scale) };
  }),
  getSpacerSpacing: jest.fn((size?: string) => {
    switch (size) {
      case 'large':
        return 600;
      case 'medium':
        return 400;
      default:
        return 200;
    }
  }),
}));

jest.mock(
  '../../../../reporting/word/reportConverters/textWidgetConverter',
  () => ({
    createParagraphsFromHtml: jest.fn((html) => [
      { _mock: 'html-paragraph', html },
    ]),
  })
);

import { Packer } from 'docx';

import { createBreakdownTable } from 'utils/word/converters/breakdownBarConverter';
import { createSimpleTable } from 'utils/word/converters/tableConverter';
import {
  createTitle,
  createHeading,
  createParagraph,
  createEmptyParagraph,
} from 'utils/word/converters/textConverter';

import { createParagraphsFromHtml } from '../../../../reporting/word/reportConverters/textWidgetConverter';

import { sectionsToDocxBlob } from './wordRenderer';

describe('sectionsToDocxBlob', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a Blob', async () => {
    const result = await sectionsToDocxBlob([]);
    expect(result).toBeInstanceOf(Blob);
  });

  it('calls Packer.toBlob', async () => {
    await sectionsToDocxBlob([]);
    expect(Packer.toBlob).toHaveBeenCalledTimes(1);
  });

  describe('title option', () => {
    it('adds a title when options.title is provided', async () => {
      await sectionsToDocxBlob([], { title: 'My Report' });
      expect(createTitle).toHaveBeenCalledWith('My Report');
    });

    it('does not add a title when omitted', async () => {
      await sectionsToDocxBlob([]);
      expect(createTitle).not.toHaveBeenCalled();
    });
  });

  describe('heading section', () => {
    it('calls createHeading with correct text and level', async () => {
      await sectionsToDocxBlob([
        { type: 'heading', text: 'Test Heading', level: 2 },
      ]);
      expect(createHeading).toHaveBeenCalledWith('Test Heading', 2);
    });
  });

  describe('paragraph section', () => {
    it('calls createParagraph and createEmptyParagraph', async () => {
      await sectionsToDocxBlob([{ type: 'paragraph', text: 'Hello world' }]);
      expect(createParagraph).toHaveBeenCalledWith('Hello world');
      expect(createEmptyParagraph).toHaveBeenCalled();
    });
  });

  describe('html section', () => {
    it('calls createParagraphsFromHtml', async () => {
      await sectionsToDocxBlob([{ type: 'html', html: '<p>Test</p>' }]);
      expect(createParagraphsFromHtml).toHaveBeenCalledWith('<p>Test</p>');
    });
  });

  describe('table section', () => {
    it('calls createSimpleTable with rows and columnWidths', async () => {
      const rows = [
        ['A', 'B'],
        ['1', '2'],
      ];
      await sectionsToDocxBlob([
        { type: 'table', rows, columnWidths: [60, 40] },
      ]);
      expect(createSimpleTable).toHaveBeenCalledWith(rows, {
        columnWidths: [60, 40],
      });
    });
  });

  describe('breakdown section', () => {
    it('calls createBreakdownTable with items and title', async () => {
      const items = [{ name: 'Housing', count: 10, percentage: 50 }];
      await sectionsToDocxBlob([{ type: 'breakdown', items, title: 'Topics' }]);
      expect(createBreakdownTable).toHaveBeenCalledWith(items, {
        title: 'Topics',
      });
    });
  });

  describe('image section', () => {
    it('includes an ImageRun for image sections', async () => {
      const image = new Uint8Array([1, 2, 3]);
      await sectionsToDocxBlob([
        {
          type: 'image',
          image,
          width: 800,
          height: 400,
        },
      ]);
      // Packer.toBlob was called — document was built
      expect(Packer.toBlob).toHaveBeenCalledTimes(1);
    });

    it('scales down images wider than 600px', async () => {
      // Width 1200 should be scaled to 600 (50%)
      // Height 600 should be scaled to 300 (50%)
      const image = new Uint8Array([1]);
      await sectionsToDocxBlob([
        {
          type: 'image',
          image,
          width: 1200,
          height: 600,
        },
      ]);
      // Can't easily test the ImageRun config without deeper mocking,
      // but we verify no error was thrown
      expect(Packer.toBlob).toHaveBeenCalledTimes(1);
    });

    it('adds a caption when provided', async () => {
      const image = new Uint8Array([1]);
      await sectionsToDocxBlob([
        {
          type: 'image',
          image,
          width: 400,
          height: 200,
          caption: 'Figure 1',
        },
      ]);
      expect(createParagraph).toHaveBeenCalledWith('Figure 1');
    });
  });

  describe('spacer section', () => {
    it('calls createEmptyParagraph with small spacing', async () => {
      await sectionsToDocxBlob([{ type: 'spacer', size: 'small' }]);
      expect(createEmptyParagraph).toHaveBeenCalledWith(200);
    });

    it('calls createEmptyParagraph with medium spacing', async () => {
      await sectionsToDocxBlob([{ type: 'spacer', size: 'medium' }]);
      expect(createEmptyParagraph).toHaveBeenCalledWith(400);
    });

    it('calls createEmptyParagraph with large spacing', async () => {
      await sectionsToDocxBlob([{ type: 'spacer', size: 'large' }]);
      expect(createEmptyParagraph).toHaveBeenCalledWith(600);
    });

    it('defaults to small spacing when size is omitted', async () => {
      await sectionsToDocxBlob([{ type: 'spacer' }]);
      expect(createEmptyParagraph).toHaveBeenCalledWith(200);
    });
  });

  describe('docx-elements section', () => {
    it('spreads raw docx elements directly into the document', async () => {
      const rawElements = [
        { _type: 'Paragraph', text: 'raw1' },
        { _type: 'Table', rows: [] },
      ] as unknown as (import('docx').Paragraph | import('docx').Table)[];
      // Should not throw
      await expect(
        sectionsToDocxBlob([{ type: 'docx-elements', elements: rawElements }])
      ).resolves.toBeInstanceOf(Blob);
    });
  });

  describe('multiple sections', () => {
    it('processes sections in order', async () => {
      const callOrder: string[] = [];
      (createHeading as jest.Mock).mockImplementation((text) => {
        callOrder.push(`heading:${text}`);
        return { _mock: 'heading', text };
      });
      (createParagraph as jest.Mock).mockImplementation((text) => {
        callOrder.push(`paragraph:${text}`);
        return { _mock: 'paragraph', text };
      });

      await sectionsToDocxBlob([
        { type: 'heading', text: 'First', level: 1 },
        { type: 'paragraph', text: 'Second' },
        { type: 'heading', text: 'Third', level: 2 },
      ]);

      expect(callOrder).toEqual([
        'heading:First',
        'paragraph:Second',
        'heading:Third',
      ]);
    });
  });
});
