import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfQuarter,
  endOfQuarter,
} from 'date-fns';

export type TimeRangeOption = 'month' | 'week' | 'quarter' | 'year' | '5years';

export const getTimeRangeDates = (
  option: TimeRangeOption,
  date: Date = new Date()
): { startDate: Date; endDate: Date } => {
  switch (option) {
    case 'month':
      return {
        startDate: startOfMonth(date),
        endDate: endOfMonth(date),
      };
    case 'week':
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
