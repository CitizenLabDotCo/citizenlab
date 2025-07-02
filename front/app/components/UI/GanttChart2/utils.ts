import { RefObject } from 'react';

import {
  startOfDay,
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
  differenceInCalendarWeeks,
  getDaysInMonth,
  setDate,
} from 'date-fns';

export type TimeRangeOption = 'month' | 'quarter' | 'year' | 'multiyear';

// --- LAYOUT CONSTANTS ---
export const quarterWidth = 48;
export const weekWidth = 48;
export const timelineHeaderHeight = 80;
export const rowHeight = 40;
export const monthWidth = 50;
export const dayWidth = 40;
export const leftColumnWidth = 260;

// --- NEW GROUPED TIME CELL STRUCTURE ---
export type SubCell = {
  key: string;
  label: string;
  width: number;
  date: Date;
};

export type TimeGroup = {
  key: string;
  label: string;
  totalWidth: number;
  subCells: SubCell[];
};

// --- REFACTORED TIME GROUP GENERATOR ---

/**
 * A generic, type-safe function to group cells.
 * @param getGroupKey - Function to get the unique key for a group (e.g., '2025-02').
 * @param getGroupLabel - Function to get the display label for a group (e.g., 'February 2025').
 * @param getSubCellLabel - Function to get the display label for a sub-cell (e.g., '15').
 */
const createGroupGenerator =
  <T extends Date>(
    getGroupKey: (date: T) => string,
    getGroupLabel: (date: T) => string,
    getSubCellLabel: (date: T) => string
  ) =>
  (cells: T[], getCellWidth: (cell: T) => number): TimeGroup[] => {
    if (!cells.length) return [];

    const groups: TimeGroup[] = [];
    let currentGroup: TimeGroup | null = null;

    for (const cell of cells) {
      const groupKey = getGroupKey(cell);
      if (!currentGroup || currentGroup.key !== groupKey) {
        currentGroup = {
          key: groupKey,
          label: getGroupLabel(cell),
          subCells: [],
          totalWidth: 0,
        };
        groups.push(currentGroup);
      }

      const subCell: SubCell = {
        key: cell.toISOString(),
        label: getSubCellLabel(cell),
        width: getCellWidth(cell),
        date: cell,
      };

      currentGroup.subCells.push(subCell);
      currentGroup.totalWidth += subCell.width;
    }

    return groups;
  };

// --- Key, Group Label, and Sub-Cell Label Generators ---
const getDayMonthKey = (date: Date) => format(date, 'yyyy-MM');
const getDayMonthLabel = (date: Date) => format(date, 'MMMM yyyy');
const getDaySubCellLabel = (date: Date) => format(date, 'd');

const getWeekYearKey = (date: Date) => getISOWeekYear(date).toString();
const getWeekYearLabel = (date: Date) => getISOWeekYear(date).toString();
const getWeekSubCellLabel = (date: Date) => getISOWeek(date).toString();

const getQuarterMonthKey = (date: Date) => format(date, 'yyyy-MM');
// UPDATED: Changed 'MMMM' to 'MMMM yyyy' to include the year in the quarter view label.
const getQuarterMonthLabel = (date: Date) => format(date, 'MMMM yyyy');
const getQuarterSubCellLabel = (date: Date) => format(date, 'd');

const getMonthYearKey = (date: Date) => getYear(date).toString();
const getMonthYearLabel = (date: Date) => getYear(date).toString();
const getMonthSubCellLabel = (date: Date) => (date.getMonth() + 1).toString();

// --- Generator Instantiation (Passing all required functions) ---
export const groupDayCellsByMonth = createGroupGenerator(
  getDayMonthKey,
  getDayMonthLabel,
  getDaySubCellLabel
);
export const groupWeekCellsByYear = createGroupGenerator(
  getWeekYearKey,
  getWeekYearLabel,
  getWeekSubCellLabel
);
export const groupQuarterCellsByMonth = createGroupGenerator(
  getQuarterMonthKey,
  getQuarterMonthLabel,
  getQuarterSubCellLabel
);
export const groupMonthCellsByYear = createGroupGenerator(
  getMonthYearKey,
  getMonthYearLabel,
  getMonthSubCellLabel
);

// --- FLAT CELL LIST GENERATORS (for item positioning) ---
export const getDayCells = (startDate: Date, endDate: Date) =>
  eachDayOfInterval({ start: startDate, end: endDate });

export const getWeekCells = (startDate: Date, endDate: Date) => {
  const weeks: Date[] = [];
  let current = startOfWeek(startDate, { weekStartsOn: 1 });
  while (current <= endDate) {
    weeks.push(current);
    current = addWeeks(current, 1);
  }
  return weeks;
};

export const getQuarterCells = (startDate: Date, endDate: Date) => {
  const cells: Date[] = [];
  let currentMonthDate = startOfMonth(startDate);
  while (currentMonthDate <= endDate) {
    const daysInMonth = getDaysInMonth(currentMonthDate);
    for (let day = 1; day <= daysInMonth; day += 3) {
      const cellStartDate = setDate(currentMonthDate, day);
      if (cellStartDate > endDate) break;
      const cellEndDate = addDays(cellStartDate, 2);
      if (startOfDay(cellEndDate) < startOfDay(startDate)) continue;
      cells.push(cellStartDate);
    }
    currentMonthDate = addMonths(currentMonthDate, 1);
  }
  return cells;
};

export const getMonthCells = (startDate: Date, endDate: Date) => {
  const cells: Date[] = [];
  let current = startOfMonth(startDate);
  while (current <= endDate) {
    cells.push(current);
    current = addMonths(current, 1);
  }
  return cells;
};

// --- GANTT ITEM OFFSET/DURATION CALCULATORS ---
export const getOffsetInDays = (timelineStart: Date, eventStart: Date) =>
  differenceInCalendarDays(eventStart, timelineStart);
export const getDurationInDays = (start: Date, end?: Date) =>
  end ? differenceInCalendarDays(end, start) + 1 : 1;

export const getOffsetInMonths = (timelineStart: Date, eventStart: Date) =>
  differenceInMonths(startOfDay(eventStart), startOfDay(timelineStart));
export const getDurationInMonths = (start: Date, end?: Date) =>
  end ? differenceInCalendarMonths(end, start) + 1 : 1;

export const getOffsetInWeeks = (timelineStart: Date, eventStart: Date) =>
  differenceInCalendarWeeks(eventStart, timelineStart, { weekStartsOn: 1 });
export const getDurationInWeeks = (start: Date, end?: Date) =>
  end ? differenceInCalendarWeeks(end, start, { weekStartsOn: 1 }) + 1 : 1;

export const getOffsetInQuarters = (cells: Date[], eventStart: Date) => {
  const eventDay = startOfDay(eventStart);
  const index = cells.findIndex(
    (cell) =>
      eventDay >= startOfDay(cell) && eventDay <= startOfDay(addDays(cell, 2))
  );
  return Math.max(0, index);
};
export const getDurationInQuarters = (
  cells: Date[],
  start: Date,
  end?: Date
) => {
  if (!end) return 1;
  const startIndex = getOffsetInQuarters(cells, start);
  const endIndex = getOffsetInQuarters(cells, end);
  return endIndex - startIndex + 1;
};

// --- GENERAL HELPERS ---
export const getTimeRangeDates = (
  range: TimeRangeOption,
  today: Date
): { startDate: Date; endDate: Date } => {
  switch (range) {
    case 'multiyear':
      return {
        startDate: startOfYear(subYears(today, 2)),
        endDate: endOfYear(addYears(today, 2)),
      };
    case 'year':
      return { startDate: subMonths(today, 6), endDate: addMonths(today, 6) };
    case 'quarter':
      return {
        startDate: startOfMonth(subMonths(today, 1)),
        endDate: endOfMonth(addMonths(today, 1)),
      };
    case 'month':
    default:
      return { startDate: subDays(today, 15), endDate: addDays(today, 15) };
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
    ref.current.scroll({ left: scrollTarget, behavior: 'smooth' });
  }
};
