import { getArrangeTargets } from './arrangeTargets';

// Orderings needn't follow on from each other: a group shows only some of
// the items beside it.
const orderings = [2, 5, 6, 9];

describe('getArrangeTargets', () => {
  it('takes an item in the middle to its neighbours or either end', () => {
    expect(getArrangeTargets({ orderings, index: 1, hasMore: false })).toEqual({
      start: 2,
      earlier: 2,
      later: 6,
      end: 9,
    });
  });

  it('leaves out the moves that would change nothing', () => {
    expect(getArrangeTargets({ orderings, index: 0, hasMore: false })).toEqual({
      later: 5,
      end: 9,
    });
    expect(getArrangeTargets({ orderings, index: 3, hasMore: false })).toEqual({
      start: 2,
      earlier: 6,
    });
  });

  it('leaves out moving to the end while more items are to load', () => {
    expect(getArrangeTargets({ orderings, index: 1, hasMore: true })).toEqual({
      start: 2,
      earlier: 2,
      later: 6,
    });
  });

  it('offers nothing to an item on its own', () => {
    expect(
      getArrangeTargets({ orderings: [4], index: 0, hasMore: false })
    ).toEqual({});
  });
});
