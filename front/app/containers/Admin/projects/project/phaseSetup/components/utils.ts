import { addDays, subDays } from 'date-fns';

import { DateRange } from 'components/admin/DatePickers/_shared/typings';

export const getDefaultMonth = (
  { from }: Partial<DateRange>,
  disabledRanges: DateRange[]
) => {
  if (from) return from;

  const lastDisabledRange = disabledRanges[disabledRanges.length - 1];
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!lastDisabledRange) return undefined;

  if (lastDisabledRange.to) {
    return new Date(lastDisabledRange.to);
  }

  return addDays(lastDisabledRange.from, 2);
};

/**
 * Adjusts end dates for calendar display.
 * If a phase ends at midnight (00:00), it visually appears to end on the previous day.
 * This prevents visual overlaps and ensures clean calendar rendering.
 */
export const adjustEndForDisplay = (date?: Date) => {
  if (!date) return date;

  const isMidnight =
    date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0;

  return isMidnight ? subDays(date, 1) : date;
};
