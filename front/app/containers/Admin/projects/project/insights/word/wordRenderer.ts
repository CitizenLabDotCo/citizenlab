/** Unified Word document renderer. Converts WordSection[] → docx Blob. */
import { Document, Packer, Paragraph, ImageRun, Table } from 'docx';

import { createBreakdownTable } from 'utils/word/converters/breakdownBarConverter';
import { createSimpleTable } from 'utils/word/converters/tableConverter';
import {
  createTitle,
  createHeading,
  createParagraph,
  createEmptyParagraph,
} from 'utils/word/converters/textConverter';
import {
  WORD_MARGINS,
  WORD_PAGE_SIZE,
  getScaledDimensions,
  getSpacerSpacing,
} from 'utils/word/utils/styleConstants';

import { createParagraphsFromHtml } from '../../../../reporting/word/reportConverters/textWidgetConverter';

import type { WordSection } from './useWordSection';

interface RendererOptions {
  title?: string;
}

/**
 * Converts a WordSection array into a downloadable .docx Blob.
 *
 * @param sections - Ordered array of Word sections to render
 * @param options  - Document-level options (title, etc.)
 */
export async function sectionsToDocxBlob(
  sections: WordSection[],
  options: RendererOptions = {}
): Promise<Blob> {
  const children: (Paragraph | Table)[] = [];

  if (options.title) {
    children.push(createTitle(options.title));
    children.push(createEmptyParagraph());
  }

  for (const section of sections) {
    switch (section.type) {
      case 'heading':
        children.push(createHeading(section.text, section.level));
        break;

      case 'paragraph':
        children.push(createParagraph(section.text));
        children.push(createEmptyParagraph());
        break;

      case 'html': {
        const paragraphs = createParagraphsFromHtml(section.html);
        children.push(...paragraphs, createEmptyParagraph());
        break;
      }

      case 'image': {
        const { width, height } = getScaledDimensions(
          section.width,
          section.height
        );
        children.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: section.image,
                transformation: { width, height },
                type: 'png',
              }),
            ],
          })
        );
        if (section.caption) {
          children.push(createParagraph(section.caption));
        }
        children.push(createEmptyParagraph());
        break;
      }

      case 'table': {
        const table = createSimpleTable(section.rows, {
          columnWidths: section.columnWidths,
        });
        children.push(table);
        children.push(createEmptyParagraph());
        break;
      }

      case 'breakdown': {
        const elements = createBreakdownTable(section.items, {
          title: section.title,
        });
        children.push(...elements);
        children.push(createEmptyParagraph());
        break;
      }

      case 'spacer':
        children.push(createEmptyParagraph(getSpacerSpacing(section.size)));
        break;

      case 'docx-elements':
        children.push(...section.elements);
        children.push(createEmptyParagraph());
        break;
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: WORD_PAGE_SIZE.width,
              height: WORD_PAGE_SIZE.height,
            },
            margin: {
              top: WORD_MARGINS.top,
              right: WORD_MARGINS.right,
              bottom: WORD_MARGINS.bottom,
              left: WORD_MARGINS.left,
            },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}
