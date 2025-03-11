import { colors } from '@citizenlab/cl2-component-library';

export const getCellBgColor = (lift: number | undefined): string => {
  if (lift === undefined) return colors.grey200;
  if (lift > 1.5) return colors.success;
  if (lift > 1) return colors.successLight;
  if (lift > 0.5) return colors.errorLight;
  return colors.error;
};

export const getCellTextColor = (lift: number | undefined): string => {
  if (lift === undefined) return colors.grey800;
  if (lift > 1.5) return colors.white;
  if (lift > 1) return colors.grey800;
  if (lift > 0.5) return colors.grey800;
  return colors.white;
};

export const convertLiftToPercentage = (lift: number | undefined): string => {
  if (lift === undefined) return '';

  // Convert lift to percentage (relative to 1.0 which represents 0% change)
  const percentage = (lift - 1) * 100;

  // Format with sign and fixed decimal places
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(0)}%`;
};
