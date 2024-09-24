import { addDays } from 'date-fns';

import { DateRange, ClosedDateRange } from '../typings';

import { allAreClosedDateRanges, isClosedDateRange } from './utils';

interface GetActionOnClickParams {
  disabledRanges: DateRange[];
  currentlySelectedDate?: Date;
  lastClickedDate: Date;
}

type SelectDateAction = {
  action: 'select-date';
  date: Date;
};

type SelectRangeAction = {
  action: 'select-range';
  range: DateRange;
};

type Action = SelectDateAction | SelectRangeAction;

export const getActionOnClick = ({
  disabledRanges,
  currentlySelectedDate,
  lastClickedDate,
}: GetActionOnClickParams): Action => {
  if (!currentlySelectedDate) {
    return {
      action: 'select-date',
      date: lastClickedDate,
    };
  }

  if (lastClickedDate <= currentlySelectedDate) {
    return {
      action: 'select-date',
      date: lastClickedDate,
    };
  }

  const potentialNewRange = {
    from: currentlySelectedDate,
    to: lastClickedDate,
  };

  if (overlaps(potentialNewRange, disabledRanges)) {
    return {
      action: 'select-date',
      date: lastClickedDate,
    };
  }

  return {
    action: 'select-range',
    range: {
      from: currentlySelectedDate,
      to: lastClickedDate,
    },
  };
};

const overlaps = (
  potentialNewRange: ClosedDateRange,
  disabledRanges: DateRange[]
) => {
  if (disabledRanges.length === 0) return false;

  if (allAreClosedDateRanges(disabledRanges)) {
    return closedRangesOverlap(potentialNewRange, disabledRanges);
  }

  if (!allAreClosedDateRanges(disabledRanges)) {
    // This means the last disabled range is open-ended.
    // We will treat it as a two-day phase.
    const newDisabledRanges = disabledRanges.map((range) => {
      if (isClosedDateRange(range)) return range;
      return {
        from: range.from,
        to: addDays(range.from, 1),
      };
    });

    return closedRangesOverlap(potentialNewRange, newDisabledRanges);
  }

  throw new Error('Unreachable');
};

const closedRangesOverlap = (
  potentialNewRange: ClosedDateRange,
  disabledRanges: ClosedDateRange[]
) => {
  return disabledRanges.some((disabledRange) => {
    if (disabledRange.to < potentialNewRange.from) return false;
    if (disabledRange.from > potentialNewRange.to) return false;

    return true;
  });
};
