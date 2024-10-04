import { addDays } from 'date-fns';

import { DateRange } from 'components/admin/DatePickers/_shared/typings';

export const getDefaultMonth = (
  { from }: Partial<DateRange>,
  disabledRanges: DateRange[]
) => {
  if (from) return from;

  const lastDisabledRange = disabledRanges[disabledRanges.length - 1];
  if (!lastDisabledRange) return undefined;

  if (lastDisabledRange.to) {
    return new Date(lastDisabledRange.to);
  }

  return addDays(lastDisabledRange.from, 2);
};
