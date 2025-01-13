import { addYears } from 'date-fns';

import { DateRange } from 'components/admin/DatePickers/_shared/typings';

interface GetStartMonthProps {
  startMonth?: Date;
  selectedRange: Partial<DateRange>;
  disabledRanges: DateRange[];
  defaultMonth?: Date;
}

export const getStartMonth = ({
  startMonth,
  selectedRange,
  disabledRanges,
  defaultMonth,
}: GetStartMonthProps) => {
  if (startMonth) return startMonth;

  const times: number[] = [addYears(new Date(), -10).getTime()];

  if (selectedRange.from) {
    times.push(addYears(selectedRange.from, -10).getTime());
  }

  if (disabledRanges.length > 0) {
    times.push(disabledRanges[0].from.getTime());
  }

  if (defaultMonth) {
    times.push(defaultMonth.getTime());
  }

  return new Date(Math.min(...times));
};

interface GetEndMonthProps {
  endMonth?: Date;
  selectedRange: Partial<DateRange>;
  disabledRanges: DateRange[];
  defaultMonth?: Date;
}

export const getEndMonth = ({
  endMonth,
  selectedRange,
  disabledRanges,
  defaultMonth,
}: GetEndMonthProps) => {
  if (endMonth) return endMonth;

  const times: number[] = [addYears(new Date(), 10).getTime()];

  if (selectedRange.to) {
    times.push(addYears(selectedRange.to, 10).getTime());
  }

  if (disabledRanges.length > 0) {
    const { from, to } = disabledRanges[0];
    times.push(to ? to.getTime() : from.getTime());
  }

  if (defaultMonth) {
    times.push(defaultMonth.getTime());
  }

  return new Date(Math.max(...times));
};
