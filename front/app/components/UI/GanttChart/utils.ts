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
  differenceInMonths,
  getISOWeek,
  getISOWeekYear,
  addWeeks,
  startOfWeek,
  endOfWeek,
  differenceInCalendarWeeks,
  getDaysInMonth,
  setDate,
  min,
} from 'date-fns';

// Defines the available zoom levels for the Gantt chart.
export type TimeRangeOption = 'month' | 'quarter' | 'year' | 'multiyear';

// Describes the metadata for a single month's header in the "Month" view.
export type MonthMeta = {
  label: string; // e.g., "July 2025"
  daysInMonth: number; // The number of days of this month visible in the timeline.
  offsetDays: number; // The cumulative offset in days from the start of the timeline.
};

/**
 * Calculates a 0-indexed offset in days from the start of the timeline.
 * @param timelineStart The start date of the entire timeline.
 * @param eventStart The date for which to calculate the offset.
 * @returns The number of days from the timeline start.
 */
export const getOffsetInDays = (
  timelineStart: Date,
  eventStart: Date
): number => {
  return differenceInCalendarDays(eventStart, timelineStart);
};

/**
 * Calculates the inclusive duration of an event in days.
 * @param start The start date of the event.
 * @param end The end date of the event.
 * @returns The duration in days (e.g., Jan 1 to Jan 1 is 1 day). Defaults to 1 if no end date.
 */
export const getDurationInDays = (start: Date, end?: Date): number => {
  if (!end) return 1;
  return differenceInCalendarDays(end, start) + 1;
};

/**
 * Calculates a 0-indexed offset in months from the start of the timeline.
 * @param timelineStart The start date of the entire timeline.
 * @param eventStart The date for which to calculate the offset.
 * @returns The number of full months from the timeline start.
 */
export const getOffsetInMonths = (
  timelineStart: Date,
  eventStart: Date
): number => {
  return differenceInMonths(startOfDay(eventStart), startOfDay(timelineStart));
};

/**
 * Calculates the inclusive duration of an event in calendar months.
 * @param start The start date of the event.
 * @param end The end date of the event.
 * @returns The duration in months. Defaults to 1 if no end date.
 */
export const getDurationInMonths = (start: Date, end?: Date): number => {
  if (!end) return 1;
  return differenceInCalendarMonths(end, start) + 1;
};

/**
 * Generates the metadata for the month headers in the "Month" (daily) view.
 * @param startDate The start date of the visible timeline portion.
 * @param endDate The end date of the visible timeline portion.
 * @returns An array of MonthMeta objects.
 */
export const getMonthMeta = (startDate: Date, endDate: Date): MonthMeta[] => {
  const months: MonthMeta[] = [];
  let currentDate = startOfMonth(startDate);
  let accumulatedOffset = 0;

  while (currentDate <= endDate) {
    const monthStart =
      currentDate < startDate ? startOfDay(startDate) : currentDate;
    // Clamp the month's end date to the overall timeline end date.
    const monthEnd = min([endOfMonth(currentDate), endOfDay(endDate)]);

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

// Describes the metadata for a single year's header in the "Multi-year" view.
export interface YearMeta {
  label: string; // e.g., "2025"
  offsetMonths: number; // The cumulative offset in months from the start of the timeline.
  monthsInYear: number; // The number of months of this year visible in the timeline.
}

/**
 * Generates the metadata for the year headers in the "Multi-year" view.
 * @param startDate The start date of the visible timeline portion.
 * @param endDate The end date of the visible timeline portion.
 * @returns An array of YearMeta objects.
 */
export const getYearMeta = (startDate: Date, endDate: Date): YearMeta[] => {
  if (endDate < startDate) {
    return [];
  }

  const startYearNum = getYear(startDate);
  const endYearNum = getYear(endDate);
  const years: YearMeta[] = [];

  for (let year = startYearNum; year <= endYearNum; year++) {
    const isFirstYear = year === startYearNum;
    const isLastYear = year === endYearNum;
    let monthsInYear: number;

    // Calculate how many months of the current year are within the timeline range.
    if (isFirstYear && isLastYear) {
      monthsInYear = differenceInCalendarMonths(endDate, startDate) + 1;
    } else if (isFirstYear) {
      monthsInYear = 12 - startDate.getMonth();
    } else if (isLastYear) {
      monthsInYear = endDate.getMonth() + 1;
    } else {
      monthsInYear = 12;
    }

    // Calculate the offset for the year block cumulatively for reliable results.
    let offsetMonths = 0;
    if (years.length > 0) {
      const lastYear = years[years.length - 1];
      offsetMonths = lastYear.offsetMonths + lastYear.monthsInYear;
    }

    if (monthsInYear > 0) {
      years.push({
        label: year.toString(),
        offsetMonths,
        monthsInYear,
      });
    }
  }

  return years;
};

/**
 * Determines the default start and end dates for the timeline based on the selected view.
 * @param range The selected time range option.
 * @param today The current date.
 * @returns An object with the calculated startDate and endDate.
 */
export const getTimeRangeDates = (
  range: TimeRangeOption,
  today: Date
): { startDate: Date; endDate: Date } => {
  switch (range) {
    case 'multiyear':
      // A 5-year window centered on the current year.
      return {
        startDate: startOfYear(subYears(today, 2)),
        endDate: endOfYear(addYears(today, 2)),
      };
    case 'year':
      // A 1-year window centered on the current date.
      return {
        startDate: subMonths(today, 6),
        endDate: addMonths(today, 6),
      };
    case 'quarter':
      // A 3-month window centered on the current month.
      return {
        startDate: startOfMonth(subMonths(today, 1)),
        endDate: endOfMonth(addMonths(today, 1)),
      };
    case 'month':
    default:
      // A ~30-day window centered on the current date.
      return {
        startDate: subDays(today, 15),
        endDate: addDays(today, 15),
      };
  }
};

/**
 * Scrolls a container element to center a specific item.
 * @param ref A React ref to the scrollable HTMLDivElement.
 * @param offset The index of the item to scroll to.
 * @param unitWidth The width in pixels of a single item.
 */
export const scrollTo = (
  ref: RefObject<HTMLDivElement>,
  offset: number,
  unitWidth: number
) => {
  if (ref.current) {
    const containerWidth = ref.current.clientWidth;
    // Calculate the scroll position to center the target item.
    const scrollTarget =
      offset * unitWidth - containerWidth / 2 + unitWidth / 2;
    ref.current.scroll({
      left: scrollTarget,
      behavior: 'smooth',
    });
  }
};

// Describes the metadata for a single 3-day cell in the "Quarter" view.
export type QuarterCellMeta = {
  label: string; // The starting day of the cell, e.g., "1", "4", "7"
  startDate: Date;
  endDate: Date;
  month: string; // The month the cell belongs to, e.g., "July 2025"
};

/**
 * Generates the metadata for the 3-day cells in the "Quarter" view.
 * @param startDate The start date of the visible timeline portion.
 * @param endDate The end date of the visible timeline portion.
 * @returns An array of QuarterCellMeta objects.
 */
export const getQuarterCellsMeta = (
  startDate: Date,
  endDate: Date
): QuarterCellMeta[] => {
  const cells: QuarterCellMeta[] = [];
  let currentMonth = startOfMonth(startDate);

  while (currentMonth <= endDate) {
    const monthLabel = format(currentMonth, 'MMMM yyyy');
    const daysInMonth = getDaysInMonth(currentMonth);

    // Create cells starting on day 1, 4, 7, etc., for the entire month.
    for (let day = 1; day <= daysInMonth; day += 3) {
      const cellStart = setDate(currentMonth, day);

      if (cellStart > endDate) break; // Don't generate cells beyond the timeline's end.

      const cellEnd = addDays(cellStart, 2);
      // Skip cells that end entirely before the timeline's start date.
      // Use startOfDay for a robust, timezone-agnostic comparison.
      if (startOfDay(cellEnd) < startOfDay(startDate)) {
        continue;
      }

      cells.push({
        label: day.toString(),
        // Clamp the cell's start and end dates to the timeline boundaries.
        startDate: cellStart < startDate ? startDate : cellStart,
        endDate: min([cellEnd, endOfMonth(currentMonth), endDate]),
        month: monthLabel,
      });
    }
    currentMonth = addMonths(currentMonth, 1);
  }
  return cells;
};

/**
 * Finds the index (offset) of a given date within the array of quarter cells.
 * @param cells The array of generated QuarterCellMeta.
 * @param eventStart The date to find.
 * @returns The 0-based index of the cell.
 */
export const getOffsetInQuarterCells = (
  cells: QuarterCellMeta[],
  eventStart: Date
): number => {
  const eventDay = startOfDay(eventStart);
  const index = cells.findIndex(
    (cell) =>
      eventDay >= startOfDay(cell.startDate) &&
      eventDay <= startOfDay(cell.endDate)
  );
  return Math.max(0, index);
};

/**
 * Calculates the inclusive duration in 3-day cells.
 * @param cells The array of generated QuarterCellMeta.
 * @param start The start date.
 * @param end The end date.
 * @returns The number of cells spanned.
 */
export const getDurationInQuarterCells = (
  cells: QuarterCellMeta[],
  start: Date,
  end?: Date
): number => {
  if (!end) return 1;
  const startIndex = getOffsetInQuarterCells(cells, start);
  const endIndex = getOffsetInQuarterCells(cells, end);
  return endIndex - startIndex + 1;
};

// Describes the metadata for a single week cell in the "Year" (weekly) view.
export type WeekMeta = {
  year: number;
  weekNumber: number; // The ISO week number.
  startDate: Date;
  endDate: Date;
};

/**
 * Generates the metadata for week cells in the "Year" (weekly) view.
 * @param startDate The start date of the visible timeline portion.
 * @param endDate The end date of the visible timeline portion.
 * @returns An array of WeekMeta objects.
 */
export const getWeekMeta = (startDate: Date, endDate: Date): WeekMeta[] => {
  const weeks: WeekMeta[] = [];
  // Start on a Monday to align with ISO week standards.
  let current = startOfWeek(startDate, { weekStartsOn: 1 });

  while (current <= endDate) {
    const weekStart = current;
    const weekEnd = endOfWeek(current, { weekStartsOn: 1 });

    weeks.push({
      year: getISOWeekYear(weekStart),
      weekNumber: getISOWeek(weekStart),
      startDate: weekStart < startDate ? startDate : weekStart,
      endDate: weekEnd > endDate ? endDate : weekEnd,
    });
    current = addWeeks(current, 1);
  }
  return weeks;
};

/**
 * Calculates a 0-indexed offset in weeks from the start of the timeline.
 * @param timelineStart The start date of the timeline.
 * @param eventStart The date for which to calculate the offset.
 * @returns The number of weeks from the timeline start.
 */
export const getOffsetInWeeks = (
  timelineStart: Date,
  eventStart: Date
): number => {
  return differenceInCalendarWeeks(eventStart, timelineStart, {
    weekStartsOn: 1,
  });
};

/**
 * Calculates the inclusive duration of an event in weeks.
 * @param start The start date of the event.
 * @param end The end date of the event.
 * @returns The duration in weeks.
 */
export const getDurationInWeeks = (start: Date, end?: Date): number => {
  if (!end) return 1;
  return (
    differenceInCalendarWeeks(end, start, {
      weekStartsOn: 1,
    }) + 1
  );
};
