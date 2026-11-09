/**
 * Tests for tableConverter.
 *
 * Word lays a table out from its column grid, so the grid is what decides
 * whether a table fills the page or collapses onto its text.
 */
import { WORD_CONTENT_WIDTH } from '../utils/styleConstants';

import { columnWidthsInTwips } from './tableConverter';

describe('columnWidthsInTwips', () => {
  it('splits the content width along the given percentages', () => {
    expect(columnWidthsInTwips(2, [60, 40])).toEqual([
      Math.round(WORD_CONTENT_WIDTH * 0.6),
      Math.round(WORD_CONTENT_WIDTH * 0.4),
    ]);
  });

  it('splits the content width evenly when no percentages are given', () => {
    expect(columnWidthsInTwips(4)).toEqual(
      Array.from({ length: 4 }, () => Math.round(WORD_CONTENT_WIDTH / 4))
    );
  });

  it('ignores percentages that do not cover every column', () => {
    expect(columnWidthsInTwips(3, [70, 30])).toEqual(columnWidthsInTwips(3));
  });

  it('takes up the full content width', () => {
    const total = columnWidthsInTwips(2, [60, 40]).reduce((a, b) => a + b, 0);

    expect(total).toBe(WORD_CONTENT_WIDTH);
  });
});
