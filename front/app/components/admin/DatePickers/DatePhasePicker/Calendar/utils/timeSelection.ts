import { DateRange } from '../../../_shared/typings';

import { getUpdatedRange } from './getUpdatedRange';
import {
  adjustRangeTimes,
  getEndTimeMaxTime,
  getStartTimeMinTime,
} from './utils';

interface DisplayTimesParams {
  selectedRange: Partial<DateRange>;
  disabledRanges: DateRange[];
  selectedStartTime: Date | null;
  selectedEndTime: Date | null;
}

// The times the start and end time inputs show. A time picked before a day
// is clicked is kept, so the next day click applies it.
export const getDisplayTimes = ({
  selectedRange,
  disabledRanges,
  selectedStartTime,
  selectedEndTime,
}: DisplayTimesParams) => ({
  startTime:
    selectedStartTime ||
    getStartTimeMinTime(selectedRange.from, disabledRanges) ||
    selectedRange.from ||
    new Date(new Date().setHours(0, 0, 0, 0)),
  endTime:
    selectedEndTime ||
    getEndTimeMaxTime(selectedRange.to, disabledRanges) ||
    selectedRange.to ||
    new Date(new Date().setHours(23, 59, 0, 0)),
});

// A one-day phase is a range of exactly 24 hours.
export const isSingleDayRange = ({ from, to }: Partial<DateRange>) =>
  !!from && !!to && to.getTime() - from.getTime() === 24 * 60 * 60 * 1000;

// A copy of `date` at the hours and minutes of `time`.
export const withTime = (date: Date, time: Date) => {
  const newDate = new Date(date);
  newDate.setHours(time.getHours());
  newDate.setMinutes(time.getMinutes());
  return newDate;
};

interface DayClickParams {
  selectedRange: Partial<DateRange>;
  disabledRanges: DateRange[];
  clickedDate: Date;
  startTime: Date;
  endTime: Date;
}

/**
 * The range after a click on an available day, with the shown times applied.
 * On a day shared with another phase, the start moves to that phase's end and
 * the end to that phase's start; those times are returned so the time inputs
 * show them. Otherwise the returned times are null.
 */
export const getRangeAfterDayClick = ({
  selectedRange,
  disabledRanges,
  clickedDate,
  startTime,
  endTime,
}: DayClickParams) => {
  const updatedRange = getUpdatedRange({
    selectedRange,
    disabledRanges,
    clickedDate,
  });

  const { from, to } = adjustRangeTimes({
    from: updatedRange.from,
    to: updatedRange.to,
    selectedStartTime: startTime,
    selectedEndTime: endTime,
  });

  const minTime = from ? getStartTimeMinTime(from, disabledRanges) : undefined;
  if (from && minTime) {
    from.setHours(minTime.getHours(), minTime.getMinutes());
  }

  const maxTime = to ? getEndTimeMaxTime(to, disabledRanges) : undefined;
  if (to && maxTime) {
    to.setHours(maxTime.getHours(), maxTime.getMinutes());
  }

  return {
    range: { from, to },
    startTime: minTime ?? null,
    endTime: maxTime ?? null,
  };
};
