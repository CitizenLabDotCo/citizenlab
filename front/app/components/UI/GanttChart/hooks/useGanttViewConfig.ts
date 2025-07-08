import { useMemo } from 'react';

import {
  groupDayCellsByMonth,
  groupWeekCellsByYear,
  groupQuarterCellsByMonth,
  groupMonthCellsByYear,
  getDayCells,
  getWeekCells,
  getQuarterCells,
  getMonthCells,
  getPreciseOffsetInDays,
  getPreciseDurationInDays,
  getPreciseOffsetInMonths,
  getPreciseDurationInMonths,
  getPreciseOffsetInWeeks,
  getPreciseDurationInWeeks,
  getPreciseOffsetInQuarters,
  getPreciseDurationInQuarters,
  quarterWidth,
  weekWidth,
  monthWidth,
  dayWidth,
} from '../utils';

/**
 * A custom hook that creates the view configuration object for the Gantt chart.
 * This isolates the static view definitions from the main component's logic.
 *
 * @param timelineStartDate The start date of the visible timeline, used for calculations.
 * @returns A memoized view configuration object.
 */
export const useGanttViewConfig = (timelineStartDate: Date) => {
  const viewConfig = useMemo(
    () => ({
      month: {
        unitWidth: dayWidth,
        getGroups: (start: Date, end: Date) =>
          groupDayCellsByMonth(getDayCells(start, end), () => dayWidth),
        getFlatCells: getDayCells,
        getOffset: (date: Date) =>
          getPreciseOffsetInDays(timelineStartDate, date),
        getDuration: (s: Date, e: Date) => getPreciseDurationInDays(s, e),
      },
      quarter: {
        unitWidth: quarterWidth,
        getGroups: (start: Date, end: Date) =>
          groupQuarterCellsByMonth(
            getQuarterCells(start, end),
            () => quarterWidth
          ),
        getFlatCells: getQuarterCells,
        getOffset: (cells: Date[], date: Date) =>
          getPreciseOffsetInQuarters(cells, date),
        getDuration: (cells: Date[], s: Date, e: Date) =>
          getPreciseDurationInQuarters(cells, s, e),
      },
      year: {
        unitWidth: weekWidth,
        getGroups: (start: Date, end: Date) =>
          groupWeekCellsByYear(getWeekCells(start, end), () => weekWidth),
        getFlatCells: getWeekCells,
        getOffset: (date: Date) =>
          getPreciseOffsetInWeeks(timelineStartDate, date),
        getDuration: (s: Date, e: Date) =>
          getPreciseDurationInWeeks(s, e, timelineStartDate),
      },
      multiyear: {
        unitWidth: monthWidth,
        getGroups: (start: Date, end: Date) =>
          groupMonthCellsByYear(getMonthCells(start, end), () => monthWidth),
        getFlatCells: getMonthCells,
        getOffset: (date: Date) =>
          getPreciseOffsetInMonths(timelineStartDate, date),
        getDuration: (s: Date, e: Date) =>
          getPreciseDurationInMonths(s, e, timelineStartDate),
      },
    }),
    [timelineStartDate]
  );

  return viewConfig;
};
