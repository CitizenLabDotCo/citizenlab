import { roundPercentage } from 'utils/math';

// Replace zeroes with '-' by convention & return strings
export const formatCountValue = (count: number): string => {
  if (count === 0) return '-';
  return count.toString();
};

export const getConversionRate = (from: number, to: number) => {
  if (to <= 0) return `0%`;
  return `${Math.min(100, roundPercentage(from, to))}%`;
};
