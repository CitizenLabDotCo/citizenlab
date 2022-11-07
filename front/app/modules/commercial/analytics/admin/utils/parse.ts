// Replace zeroes with '-' by convention & return strings
export const formatCountValue = (count: number): string => {
  if (count === 0) return '-';
  return count.toString();
};
