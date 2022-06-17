export const sum = (values: number[]) => values.reduce((acc, v) => v + acc, 0);

export const percentage = (num: number, denom: number) =>
  Math.round((num / denom) * 100);
