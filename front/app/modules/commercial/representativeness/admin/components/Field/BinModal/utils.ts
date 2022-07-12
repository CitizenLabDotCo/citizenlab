import { Bins } from '.';

export const updateLowerBound = (
  bins: Bins,
  groupIndex: number,
  newValue: number
): Bins => {
  const binsCloned: Bins = bins.map((bin) => [...bin]);
  binsCloned[groupIndex][0] = newValue;

  if (groupIndex !== 0) {
    binsCloned[groupIndex - 1][1] = newValue - 1;
  }

  return binsCloned;
};

export const updateUpperBound = (bins: Bins, newValue: number): Bins => {
  const binsCloned: Bins = bins.map((bin) => [...bin]);
  binsCloned[bins.length - 1][1] = newValue;

  return binsCloned;
};
