import { addDays } from 'date-fns';

import { DateRange } from 'components/admin/DatePickers/DatePhasePicker/typings';

export const getDefaultMonth = (
  { from }: Partial<DateRange>,
  disabledRanges: DateRange[]
) => {
  if (from) return from;

  const lastDisabledRange = disabledRanges[disabledRanges.length - 1];
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!lastDisabledRange) return undefined;

  if (lastDisabledRange.to) {
    return new Date(lastDisabledRange.to);
  }

  return addDays(lastDisabledRange.from, 2);
};
