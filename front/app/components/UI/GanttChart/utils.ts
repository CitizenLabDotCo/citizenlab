import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfQuarter,
  endOfQuarter,
  startOfDay,
  add,
} from 'date-fns';

export type TimeRangeOption = 'month' | 'week' | 'quarter' | 'year' | '5years';

export const getTimeRangeDates = (
  option: TimeRangeOption,
  date: Date = new Date()
): { startDate: Date; endDate: Date } => {
  let endDate;
  switch (option) {
    case 'month':
      return {
        startDate: startOfMonth(date),
        endDate: endOfMonth(date),
      };
    case 'week':
      // Assuming week starts on Monday
      return {
        startDate: startOfWeek(date, { weekStartsOn: 1 }),
        endDate: endOfWeek(date, { weekStartsOn: 1 }),
      };
    case 'quarter':
      return {
        startDate: startOfQuarter(date),
        endDate: endOfQuarter(date),
      };
    case 'year':
      return {
        startDate: new Date(date.getFullYear(), 0, 1),
        endDate: new Date(date.getFullYear(), 11, 31),
      };
    case '5years':
      return {
        startDate: new Date(date.getFullYear() - 2, 0, 1),
        endDate: new Date(date.getFullYear() + 2, 11, 31),
      };
    default:
      return {
        startDate: startOfMonth(date),
        endDate: endOfMonth(date),
      };
  }
};

export const scrollToToday = (
  timelineBodyRef: React.RefObject<HTMLDivElement>,
  todayOffset: number,
  dayWidth: number
) => {
  if (timelineBodyRef.current) {
    const scrollLeft =
      todayOffset * dayWidth - timelineBodyRef.current.clientWidth / 2;
    timelineBodyRef.current.scrollTo({
      left: Math.max(0, scrollLeft),
      behavior: 'smooth',
    });
  }
};

export const daysBetween = (a: Date, b: Date) => {
  const start = startOfDay(a);
  const end = startOfDay(b);
  // Add 1 to include the last day
  return (
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );
};

export function getMonthMeta(start: Date, end: Date) {
  const months: {
    label: string;
    monthStart: Date;
    daysInMonth: number;
    offsetDays: number;
  }[] = [];
  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  while (current <= end) {
    const year = current.getFullYear();
    const monthIndex = current.getMonth();
    const monthStart = new Date(year, monthIndex, 1);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const offsetDays = Math.max(0, daysBetween(start, monthStart) - 1);
    months.push({
      label: monthStart.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      }),
      monthStart,
      daysInMonth,
      offsetDays,
    });
    current = new Date(year, monthIndex + 1, 1);
  }
  return months;
}
