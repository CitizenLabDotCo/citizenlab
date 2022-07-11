import { updateLowerBound } from './utils';
import { Bins } from '.';

const getDummyBins = (): Bins => [
  [18, 24],
  [25, 34],
  [35, 44],
  [45, 54],
  [55, 64],
  [65, Infinity],
];

describe('updateLowerBound', () => {
  it('works if new value is lower than old value', () => {
    const bins = getDummyBins();

    const newBins = updateLowerBound(bins, 2, 27);

    const expectedNewBins: Bins = [
      [18, 24],
      [25, 26],
      [27, 44],
      [45, 54],
      [55, 64],
      [65, Infinity],
    ];

    expect(newBins).toEqual(expectedNewBins);
  });

  it('works if new value is higher than old value', () => {
    const bins = getDummyBins();

    const newBins = updateLowerBound(bins, 2, 43);

    const expectedNewBins = [
      [18, 24],
      [25, 42],
      [43, 44],
      [45, 54],
      [55, 64],
      [65, Infinity],
    ];

    expect(newBins).toEqual(expectedNewBins);
  });
});
