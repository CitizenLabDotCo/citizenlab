import { addDays, isSameDay } from 'date-fns';

import { DateRange } from 'components/admin/DatePickers/_shared/typings';

import { ClosedDateRange } from '../../typings';

import { rangesValid } from './rangesValid';
import { isClosedDateRange } from './utils';

interface GetUpdatedRangeParams {
  selectedRange: Partial<DateRange>;
  disabledRanges: DateRange[];
  clickedDate: Date;
}

export const getUpdatedRange = ({
  selectedRange: { from, to },
  disabledRanges,
  clickedDate,
}: GetUpdatedRangeParams): Partial<DateRange> => {
  const { valid, reason } = rangesValid({ from, to }, disabledRanges);

  if (!valid) {
    throw new Error(reason);
  }

  if (from === undefined) {
    return {
      from: clickedDate,
    };
  }

  if (isSameDay(from, clickedDate)) {
    return {
      from: clickedDate,
      to: clickedDate,
    };
  }

  if (from > clickedDate) {
    return {
      from: clickedDate,
    };
  }

  if (to === undefined) {
    const potentialNewRange = {
      from,
      to: clickedDate,
    };

    const newDisabledRanges = replaceLastOpenEndedRange(disabledRanges);

    if (rangeOverlapsWithDisabledRange(potentialNewRange, newDisabledRanges)) {
      return {
        from: clickedDate,
      };
    }

    return {
      from,
      to: clickedDate,
    };
  }

  return {
    from: clickedDate,
  };
};

// Utility to replace the last open-ended range with a closed range.
// This simplifies a lot of logic and makes the types easier to work with.
const replaceLastOpenEndedRange = (
  disabledRanges: DateRange[]
): ClosedDateRange[] => {
  return disabledRanges.map((range) => {
    if (!isClosedDateRange(range)) {
      return {
        from: range.from,
        to: addDays(range.from, 1),
      };
    }

    return range;
  });
};

const rangeOverlapsWithDisabledRange = (
  range: ClosedDateRange,
  disabledRanges: ClosedDateRange[]
) => {
  return disabledRanges.some((disabledRange) => {
    return range.from <= disabledRange.to && range.to >= disabledRange.from;
  });
};
