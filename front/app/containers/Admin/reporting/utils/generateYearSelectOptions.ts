import { IOption } from 'typings';

export const generateYearSelectOptions = (
  startYear: number,
  endYear?: number
) => {
  // Guard against invalid year inputs
  if (endYear && endYear < startYear) {
    return [];
  }

  // Start at startYear, and go up to present
  const years: IOption[] = [];

  // If no specific endYear is provided, use the current year
  const endYearValue = endYear || new Date().getFullYear();

  for (let i = startYear; i <= endYearValue; i++) {
    years.push({ value: i.toString(), label: i.toString() });
  }
  return years;
};
