export const formatPercentage = (value: number | undefined) => {
  if (value === undefined) return '0%';
  const cappedValue = Math.min(value, 1);
  return cappedValue.toLocaleString(undefined, { style: 'percent' });
};
