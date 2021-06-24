import { sliceEventsToPage, getNumberOfPages } from './eventViewerUtils';

describe('sliceEventsToPage', () => {
  it('returns empty array when events is empty array', () => {
    expect(sliceEventsToPage([], 1, 10)).toEqual([]);
  });
  it('returns correct events when events.length < 10', () => {
    expect(sliceEventsToPage([0, 1, 2, 3], 1, 10)).toEqual([0, 1, 2, 3]);
  });
  it('returns correct events for page 1 if events.length === 15', () => {
    const events = Array(15)
      .fill(0)
      .map((_, i) => i);
    expect(sliceEventsToPage(events, 1, 10)).toEqual([
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
    ]);
  });
  it('returns correct events for page 2 if events.length === 15', () => {
    const events = Array(15)
      .fill(0)
      .map((_, i) => i);
    expect(sliceEventsToPage(events, 2, 10)).toEqual([10, 11, 12, 13, 14]);
  });
});

describe('getNumberOfPages', () => {
  it('returns correct number of pages', () => {
    expect(getNumberOfPages(15, 10)).toBe(2);
  });
});
