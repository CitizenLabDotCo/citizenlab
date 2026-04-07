import { isSameDay } from 'date-fns';

import { DateRange } from '../../../_shared/typings';
import { ClosedDateRange } from '../../typings';

export const isClosedDateRange = (range: DateRange): range is ClosedDateRange =>
  !!range.to;

export const allAreClosedDateRanges = (
  ranges: DateRange[]
): ranges is ClosedDateRange[] => ranges.every(isClosedDateRange);

export function isDayBlocked(day: Date, disabledRanges: DateRange[]): boolean {
  // Check if the day is fully occupied (no available time)
  // if start at midnight or end at 23:59, then it's fully occupied and we shouldn't allow selecting it
  for (const range of disabledRanges) {
    if (isSameDay(range.from, day)) {
      const startAtMidnight =
        range.from.getHours() === 0 && range.from.getMinutes() === 0;
      if (startAtMidnight) {
        return true;
      }
    }

    if (range.to && isSameDay(range.to, day)) {
      const endAtAlmostMidnight =
        range.to.getHours() === 23 && range.to.getMinutes() === 59;
      if (endAtAlmostMidnight) {
        return true;
      }
    }
  }

  // Block selection if there are at least one start and one end on this day
  let startCount = 0;
  let endCount = 0;

  for (const range of disabledRanges) {
    if (isSameDay(range.from, day)) {
      startCount += 1;
    }
    if (range.to && isSameDay(range.to, day)) {
      endCount += 1;
    }
  }

  if (startCount >= 1 && endCount >= 1) {
    return true;
  }

  return false;
}

// Adjust the from and to times based on the selected times and whether it's a same-day selection
export function adjustRangeTimes({
  from,
  to,
  selectedStartTime,
  selectedEndTime,
}: {
  from?: Date;
  to?: Date;
  selectedStartTime: Date;
  selectedEndTime: Date;
}): { from?: Date; to?: Date } {
  const newFrom = from ? new Date(from) : undefined;
  let newTo = to ? new Date(to) : undefined;
  const isSameDaySelection = newFrom && newTo && isSameDay(newFrom, newTo);

  if (newFrom) {
    if (isSameDaySelection) {
      newFrom.setHours(0, 0, 0, 0);
    } else {
      newFrom.setHours(
        selectedStartTime.getHours(),
        selectedStartTime.getMinutes(),
        0,
        0
      );
    }
  }

  if (newTo) {
    //  if it's a same-day selection, Set end to next day at 00:00 (midnight)
    if (isSameDaySelection) {
      newTo = new Date(newFrom);
      newTo.setDate(newTo.getDate() + 1);
      newTo.setHours(0, 0, 0, 0);
    } else if (
      // in case changed from same-day to different days, set again to default end time
      selectedEndTime.getHours() === 0 &&
      selectedEndTime.getMinutes() === 0
    ) {
      newTo.setHours(23, 59, 0, 0);
    } else {
      newTo.setHours(
        selectedEndTime.getHours(),
        selectedEndTime.getMinutes(),
        0,
        0
      );
    }
  }

  return { from: newFrom, to: newTo };
}
