import { isSameDay, startOfDay } from 'date-fns';

import { DateRange } from '../../../_shared/typings';

import { isClosedDateRange, isDayBlocked } from './utils';

// Days a click cannot select: inside another phase, a one-day phase, or a
// boundary day with no time left (see isDayBlocked). A day where another
// phase starts or ends partway through stays available.
export const isDayUnavailable = (day: Date, disabledRanges: DateRange[]) => {
  const dayStart = startOfDay(day).getTime();

  const insideClosedRange = disabledRanges
    .filter(isClosedDateRange)
    .some(({ from, to }) =>
      isSameDay(from, to)
        ? isSameDay(from, day)
        : startOfDay(from).getTime() < dayStart &&
          dayStart < startOfDay(to).getTime()
    );

  return insideClosedRange || isDayBlocked(day, disabledRanges);
};
