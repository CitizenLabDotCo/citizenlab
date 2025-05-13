import {
  addBin,
  getLowerBoundLimits,
  getUpperBoundLimits,
  removeBin,
} from './bins';

describe('getLowerBoundLimits', () => {
  it('works when all bins are empty', () => {
    const bins = [null, null, null, null, null];

    expect(getLowerBoundLimits(bins, 0)).toEqual([0, 123]);
    expect(getLowerBoundLimits(bins, 1)).toEqual([2, 125]);
    expect(getLowerBoundLimits(bins, 2)).toEqual([4, 127]);
    expect(getLowerBoundLimits(bins, 3)).toEqual([6, 129]);
  });

  it('works when some bins are empty', () => {
    const bins = [18, 25, null, null, 100];

    expect(getLowerBoundLimits(bins, 0)).toEqual([0, 23]);
    expect(getLowerBoundLimits(bins, 1)).toEqual([20, 95]);
    expect(getLowerBoundLimits(bins, 2)).toEqual([27, 97]);
    expect(getLowerBoundLimits(bins, 3)).toEqual([29, 99]);
  });

  it('works when no bins are empty (no upper bound)', () => {
    const bins = [18, 25, 45, 65, null];

    expect(getLowerBoundLimits(bins, 0)).toEqual([0, 23]);
    expect(getLowerBoundLimits(bins, 1)).toEqual([20, 43]);
    expect(getLowerBoundLimits(bins, 2)).toEqual([27, 63]);
    expect(getLowerBoundLimits(bins, 3)).toEqual([47, 129]);
  });

  it('works when no bins are empty (with upper bound)', () => {
    const bins = [18, 25, 45, 65, 100];

    expect(getLowerBoundLimits(bins, 0)).toEqual([0, 23]);
    expect(getLowerBoundLimits(bins, 1)).toEqual([20, 43]);
    expect(getLowerBoundLimits(bins, 2)).toEqual([27, 63]);
    expect(getLowerBoundLimits(bins, 3)).toEqual([47, 99]);
  });
});

describe('getUpperBoundLimits', () => {
  it('works when all bins are empty', () => {
    const bins = [null, null, null, null, null];
    expect(getUpperBoundLimits(bins)).toEqual([7, 130]);
  });

  it('works when some bins are empty', () => {
    const bins = [18, 25, null, null, 100];
    expect(getUpperBoundLimits(bins)).toEqual([30, 130]);
  });

  it('works when no bins are empty (no upper bound)', () => {
    const bins = [18, 25, 45, 65, null];
    expect(getUpperBoundLimits(bins)).toEqual([66, 130]);
  });

  it('works when no bins are empty (with upper bound)', () => {
    const bins = [18, 25, 45, 65, 100];
    expect(getUpperBoundLimits(bins)).toEqual([66, 130]);
  });
});

describe('addBin', () => {
  it('works if no upper bound', () => {
    const bins = [18, 25, 35, 45, 65, null];
    const expectedBins = [18, 25, 35, 45, 65, null, null];

    expect(addBin(bins)).toEqual(expectedBins);
  });

  it('works if upper bound', () => {
    const bins = [18, 25, 35, 45, 65, 80];
    const expectedBins = [18, 25, 35, 45, 65, 80, null];

    expect(addBin(bins)).toEqual(expectedBins);
  });

  it('works if upper bound is only 1 higher than highest lower bound', () => {
    const bins = [18, 25, 35, 45, 65, 66];
    const expectedBins = [18, 25, 35, 45, 65, 67, null];

    expect(addBin(bins)).toEqual(expectedBins);
  });
});

describe('removeBin', () => {
  it('results in no upper bound if previous lower bound is null', () => {
    const bins = [18, 25, 35, 45, 65, null, null];
    const expectedBins = [18, 25, 35, 45, 65, null];

    expect(removeBin(bins)).toEqual(expectedBins);
  });

  it('results in no upper bound if previous lower bound is not null', () => {
    const bins = [18, 25, 35, 45, 65, 80, null];
    const expectedBins = [18, 25, 35, 45, 65, null];

    expect(removeBin(bins)).toEqual(expectedBins);
  });
});
