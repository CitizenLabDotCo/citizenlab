export const sum = (values: number[]) => values.reduce((acc, v) => v + acc, 0);

export const roundPercentage = (num: number, denom: number) =>
  Math.round((num / denom) * 100);

// See https://stackoverflow.com/a/13483710
export const roundPercentages = (values: number[], decimals = 0): number[] => {
  const total = sum(values);

  if (total === 0) {
    return Array(values.length).fill(0);
  }

  const multiplier = 10 ** decimals;
  const factor = 100 * multiplier;
  const unrounded = values.map((value) => (value / total) * factor);
  const floored = unrounded.map(Math.floor);
  const sumFloored = sum(floored);

  const difference = factor - sumFloored;

  if (difference === 0) {
    return floored.map((value) => value / multiplier);
  }

  const remainders = unrounded.map((value, i) => value - floored[i]);

  const sortedIndices = [...Array(remainders.length)]
    .map((_, i) => i)
    .sort((a, b) => remainders[b] - remainders[a]);

  for (let i = 0; i < difference; i++) {
    floored[sortedIndices[i]]++;
  }

  return floored.map((value) => value / multiplier);
};
