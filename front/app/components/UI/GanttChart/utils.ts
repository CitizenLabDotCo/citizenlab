import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  differenceInCalendarDays,
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
  getDate,
  getDay,
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

// --- GROUPED TIME CELL STRUCTURE ---
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

const getDayMonthKey = (date: Date) => format(date, 'yyyy-MM');
const getDayMonthLabel = (date: Date) => format(date, 'MMMM yyyy');
const getDaySubCellLabel = (date: Date) => format(date, 'd');
const getWeekYearKey = (date: Date) => getISOWeekYear(date).toString();
const getWeekYearLabel = (date: Date) => getISOWeekYear(date).toString();
const getWeekSubCellLabel = (date: Date) => getISOWeek(date).toString();
const getQuarterMonthKey = (date: Date) => format(date, 'yyyy-MM');
const getQuarterMonthLabel = (date: Date) => format(date, 'MMMM yyyy');
const getQuarterSubCellLabel = (date: Date) => format(date, 'd');
const getMonthYearKey = (date: Date) => getYear(date).toString();
const getMonthYearLabel = (date: Date) => getYear(date).toString();
const getMonthSubCellLabel = (date: Date) => (date.getMonth() + 1).toString();

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

// --- FLAT CELL LIST GENERATORS ---
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

// --- PRECISION CALCULATIONS ---
// For "Month" (daily) view, precision is already 1 day.
export const getPreciseOffsetInDays = (timelineStart: Date, eventStart: Date) =>
  differenceInCalendarDays(eventStart, timelineStart);
export const getPreciseDurationInDays = (start: Date, end: Date) =>
  differenceInCalendarDays(end, start) + 1;

// For "Multi-year" (monthly) view.
export const getPreciseOffsetInMonths = (
  timelineStart: Date,
  eventStart: Date
) => {
  const baseOffset = differenceInMonths(
    startOfMonth(eventStart),
    startOfMonth(timelineStart)
  );
  const dayOfMonth = getDate(eventStart);
  const daysInMonth = getDaysInMonth(eventStart);
  const fraction = (dayOfMonth - 1) / daysInMonth;
  return baseOffset + fraction;
};
export const getPreciseDurationInMonths = (
  start: Date,
  end: Date,
  timelineStart: Date
) => {
  return (
    getPreciseOffsetInMonths(timelineStart, endOfDay(end)) -
    getPreciseOffsetInMonths(timelineStart, startOfDay(start))
  );
};

// For "Year" (weekly) view.
export const getPreciseOffsetInWeeks = (
  timelineStart: Date,
  eventStart: Date
) => {
  const baseOffset = differenceInCalendarWeeks(eventStart, timelineStart, {
    weekStartsOn: 1,
  });
  // getDay returns 0 for Sunday, 1 for Monday etc. We want Monday to be 0.
  const dayOfWeek = (getDay(eventStart) + 6) % 7;
  const fraction = dayOfWeek / 7;
  return baseOffset + fraction;
};
export const getPreciseDurationInWeeks = (
  start: Date,
  end: Date,
  timelineStart: Date
) => {
  return (
    getPreciseOffsetInWeeks(timelineStart, endOfDay(end)) -
    getPreciseOffsetInWeeks(timelineStart, startOfDay(start))
  );
};

// For "Quarter" (3-day segments) view.
export const getPreciseOffsetInQuarters = (cells: Date[], eventStart: Date) => {
  const eventDay = startOfDay(eventStart);
  const cellIndex = cells.findIndex(
    (cell) =>
      eventDay >= startOfDay(cell) && eventDay <= startOfDay(addDays(cell, 2))
  );
  if (cellIndex === -1) return 0;

  const cellStartDate = cells[cellIndex];
  const daysIntoCell = differenceInCalendarDays(eventDay, cellStartDate);
  const fraction = daysIntoCell / 3; // Each cell is 3 days wide
  return cellIndex + fraction;
};
export const getPreciseDurationInQuarters = (
  cells: Date[],
  start: Date,
  end: Date
) => {
  return (
    getPreciseOffsetInQuarters(cells, endOfDay(end)) -
    getPreciseOffsetInQuarters(cells, startOfDay(start))
  );
};

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
