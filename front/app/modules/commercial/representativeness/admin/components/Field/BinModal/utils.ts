import { Bins } from '.';

export const validateBins = (bins: Bins) => {
  for (let i = 0; i < bins.length - 1; i++) {
    if (bins[i] === null) return false;
  }

  return true;
};

export const allBinsEmpty = (bins: Bins) => {
  return bins.every((bin) => bin === null);
};

export const updateLowerBound = (
  bins: Bins,
  binIndex: number,
  newValue: number | null
): Bins => {
  const clonedBins = [...bins];
  clonedBins[binIndex] = newValue;

  return clonedBins;
};

export const updateUpperBound = (bins: Bins, newValue: number | null): Bins => {
  const clonedBins = [...bins];
  clonedBins[clonedBins.length - 1] = newValue;

  return clonedBins;
};

const ABSOLUTE_MIN = 0;
const ABSOLUTE_MAX = 130;

export const getLowerBoundLimits = (bins: Bins, binIndex: number) => [
  getLowerBoundMin(bins, binIndex),
  getLowerBoundMax(bins, binIndex),
];

const getLowerBoundMin = (bins: Bins, binIndex: number) => {
  if (binIndex === 0) return ABSOLUTE_MIN;

  for (let i = binIndex - 1; i >= 0; i--) {
    const bin = bins[i];

    if (bin !== null) {
      return bin + (binIndex - i) * 2;
    }
  }

  return ABSOLUTE_MIN + binIndex * 2;
};

const getLowerBoundMax = (bins: Bins, binIndex: number) => {
  if (binIndex === bins.length - 2) {
    const upperBound = bins[bins.length - 1];

    if (upperBound !== null) {
      return upperBound - 1;
    }

    return ABSOLUTE_MAX - 1;
  }

  for (let i = binIndex + 1; i < bins.length - 1; i++) {
    const bin = bins[i];

    if (bin !== null) {
      return bin - (i - binIndex) * 2;
    }
  }

  const upperBound = bins[bins.length - 1];

  return upperBound === null
    ? ABSOLUTE_MAX - (bins.length - binIndex) * 2 + 3
    : upperBound - (bins.length - binIndex) * 2 + 3;
};

export const getUpperBoundLimits = (bins: Bins) => {
  const lowerBoundLastBin = bins[bins.length - 2];

  const lastLowerBoundMin =
    lowerBoundLastBin === null
      ? getLowerBoundMin(bins, bins.length - 2)
      : lowerBoundLastBin;

  return [lastLowerBoundMin + 1, ABSOLUTE_MAX];
};

export const removeBin = (bins: Bins) => {
  const sliced = bins.slice(0, bins.length - 1);
  const newLastBin = sliced[sliced.length - 1];

  sliced[sliced.length - 1] = newLastBin === null ? newLastBin : newLastBin - 1;

  return sliced;
};

const defined = (bound: string | undefined) =>
  bound !== undefined && bound !== '';

export const parseLabel = (
  lowerBound: string | undefined,
  upperBound: string | undefined,
  isLastBin: boolean,
  andOverMessage: string
) => {
  if (isLastBin && defined(lowerBound) && !defined(upperBound)) {
    return andOverMessage;
  }

  if (defined(lowerBound) && defined(upperBound)) {
    return `${lowerBound}-${upperBound}`;
  }

  return '';
};

export const addBin = (bins: Bins) => {
  return [...bins, null];
};
