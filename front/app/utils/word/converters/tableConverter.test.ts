/**
 * Tests for tableConverter.
 *
 * Word lays a table out from its column grid, so the grid is what decides
 * whether a table fills the page or collapses onto its text.
 */
import { Document, Packer, Table } from 'docx';
import JSZip from 'jszip';

import { WORD_CONTENT_WIDTH } from '../utils/styleConstants';

import { createSimpleTable } from './tableConverter';

const columnGrid = async (table: Table) => {
  const doc = new Document({ sections: [{ children: [table] }] });
  const zip = await JSZip.loadAsync(await Packer.toBuffer(doc));
  const document = zip.file('word/document.xml');
  if (!document) throw new Error('The generated docx has no document.xml');

  const xml = await document.async('string');

  return [...xml.matchAll(/<w:gridCol w:w="(\d+)"\/>/g)].map((match) =>
    Number(match[1])
  );
};

describe('createSimpleTable', () => {
  const rows = [
    ['Metric', 'Value'],
    ['Visitors', '2'],
  ];

  it('sizes the column grid from the given percentages', async () => {
    const table = createSimpleTable(rows, { columnWidths: [60, 40] });

    expect(await columnGrid(table)).toEqual([
      Math.round(WORD_CONTENT_WIDTH * 0.6),
      Math.round(WORD_CONTENT_WIDTH * 0.4),
    ]);
  });

  it('splits the width evenly when no percentages are given', async () => {
    const table = createSimpleTable(rows);

    expect(await columnGrid(table)).toEqual([
      Math.round(WORD_CONTENT_WIDTH / 2),
      Math.round(WORD_CONTENT_WIDTH / 2),
    ]);
  });
});
