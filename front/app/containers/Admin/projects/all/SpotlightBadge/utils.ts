// Small helpers for the spotlight badge. Added because the shared text utils
// did not have exactly what we needed here.
export const truncateText = (str: string, maxLength: number) => {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
};
