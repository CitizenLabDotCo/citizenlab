import { RefObject } from 'react';

import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  addMonths,
  subMonths,
  addYears,
  subYears,
  getYear,
  format,
  subDays,
  addDays,
  startOfYear,
  endOfYear,
} from 'date-fns';

export type TimeRangeOption = 'month' | 'quarter' | 'year' | '5years';

export type MonthMeta = {
  label: string;
  daysInMonth: number;
  offsetDays: number;
};

export type YearMeta = {
  label: string;
  offsetMonths: number;
  monthsInYear: number;
};

// Calculates a 0-indexed offset in days from the start of the timeline.
export const getOffsetInDays = (
  timelineStart: Date,
  eventStart: Date
): number => {
  return differenceInCalendarDays(eventStart, timelineStart);
};

// Calculates the inclusive duration of an event in days
export const getDurationInDays = (start: Date, end?: Date): number => {
  if (!end) return 1; // Default to 1 day if no end date
  // Add +1 to make the duration inclusive of the end date
  return differenceInCalendarDays(end, start) + 1;
};

// Calculates a 0-indexed offset in months from the start of the timeline.
export const getOffsetInMonths = (
  timelineStart: Date,
  eventStart: Date
): number => {
  return differenceInCalendarMonths(eventStart, timelineStart);
};

// Calculates the inclusive duration of an event in months.
export const getDurationInMonths = (start: Date, end?: Date): number => {
  if (!end) return 1; // Default to 1 month if no end date
  // Add +1 to make the duration inclusive of the end date
  return differenceInCalendarMonths(end, start) + 1;
};

export const getMonthMeta = (startDate: Date, endDate: Date): MonthMeta[] => {
  const months: MonthMeta[] = [];
  let currentDate = startOfMonth(startDate);
  let accumulatedOffset = 0;

  while (currentDate <= endDate) {
    const monthStart =
      currentDate < startDate ? startOfDay(startDate) : currentDate;
    const monthEnd =
      endOfMonth(currentDate) > endDate
        ? endOfDay(endDate)
        : endOfMonth(currentDate);

    const daysInMonth = eachDayOfInterval({
      start: monthStart,
      end: monthEnd,
    }).length;

    months.push({
      label: format(currentDate, 'MMMM yyyy'),
      daysInMonth,
      offsetDays: accumulatedOffset,
    });

    accumulatedOffset += daysInMonth;
    currentDate = addMonths(currentDate, 1);
  }
  return months;
};

export const getYearMeta = (startDate: Date, endDate: Date): YearMeta[] => {
  const startYearNum = getYear(startDate);
  const endYearNum = getYear(endDate);
  const years: YearMeta[] = [];

  for (let year = startYearNum; year <= endYearNum; year++) {
    const yearStartDate = startOfYear(new Date(year, 0, 1));
    const offsetMonths = getOffsetInMonths(startDate, yearStartDate);

    years.push({
      label: year.toString(),
      offsetMonths: offsetMonths < 0 ? 0 : offsetMonths,
      monthsInYear: 12,
    });
  }
  return years;
};

export const getTimeRangeDates = (
  range: TimeRangeOption,
  today: Date
): { startDate: Date; endDate: Date } => {
  switch (range) {
    case '5years':
      return {
        startDate: startOfYear(subYears(today, 2)),
        endDate: endOfYear(addYears(today, 2)),
      };
    case 'year':
      return {
        startDate: subMonths(today, 6),
        endDate: addMonths(today, 6),
      };
    case 'quarter':
      return {
        startDate: subMonths(today, 2),
        endDate: addMonths(today, 2),
      };
    case 'month':
    default:
      return {
        startDate: subDays(today, 15),
        endDate: addDays(today, 15),
      };
  }
};

export const scrollTo = (
  ref: RefObject<HTMLDivElement>,
  offset: number,
  unitWidth: number
) => {
  if (ref.current) {
    const containerWidth = ref.current.clientWidth;
    const scrollTarget =
      offset * unitWidth - containerWidth / 2 + unitWidth / 2;
    ref.current.scrollLeft = scrollTarget;
  }
};

export const getLabelFromScroll = (
  scrollLeft: number,
  isYearlyView: boolean,
  dailyData: { months: ReturnType<typeof getMonthMeta> } | null,
  yearlyData: { years: ReturnType<typeof getYearMeta> } | null,
  dayWidth: number,
  monthWidth: number
) => {
  if (isYearlyView && yearlyData) {
    for (let i = yearlyData.years.length - 1; i >= 0; i--) {
      const y = yearlyData.years[i];
      if (scrollLeft >= y.offsetMonths * monthWidth) return y.label;
    }
  } else if (dailyData) {
    for (let i = dailyData.months.length - 1; i >= 0; i--) {
      const m = dailyData.months[i];
      if (scrollLeft >= m.offsetDays * dayWidth) return m.label;
    }
  }
  return '';
};
