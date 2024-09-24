import { getNextSelectedRange } from './getNextSelectedRange';

describe('getNextSelectedRange', () => {
  const DISABLED_RANGES = [
    { from: new Date(2024, 8, 1), to: new Date(2024, 9, 5) },
    { from: new Date(2024, 9, 21), to: new Date(2024, 10, 28) },
  ];

  it('returns new range if no overlap with disabled ranges', () => {
    const currentlySelectedDate = new Date(2024, 9, 10);
    const lastClickedDate = new Date(2024, 9, 20);

    expect(
      getNextSelectedRange({
        disabledRanges: DISABLED_RANGES,
        currentlySelectedDate,
        lastClickedDate,
      })
    ).toEqual({
      from: currentlySelectedDate,
      to: lastClickedDate,
    });
  });

  it('does not return new range if overlap with disabled ranges', () => {
    const currentlySelectedDate = new Date(2024, 9, 10);
    const lastClickedDate = new Date(2024, 10, 30);

    expect(
      getNextSelectedRange({
        disabledRanges: DISABLED_RANGES,
        currentlySelectedDate,
        lastClickedDate,
      })
    ).toEqual(undefined);
  });
});
