import { addDays } from 'date-fns';

import { DateRange } from '../_shared/typings';

/**
 * Utility to handle the case where the last disabled range is open,
 * and the user selects a range after that.
 */
export const patchDisabledRanges = (
  { from }: Partial<DateRange>,
  disabledRanges: DateRange[]
) => {
  if (from === undefined) {
    return disabledRanges;
  }

  if (disabledRanges.length === 0) {
    return disabledRanges;
  }

  const lastDisabledRange = disabledRanges[disabledRanges.length - 1];

  if (
    lastDisabledRange.to === undefined &&
    from.getTime() > lastDisabledRange.from.getTime()
  ) {
    return [
      ...disabledRanges.slice(0, -1),
      { from: lastDisabledRange.from, to: addDays(from, -1) },
    ];
  }

  return disabledRanges;
};
