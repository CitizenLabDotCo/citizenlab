import { addYears } from 'date-fns';

interface GetStartMonthProps {
  startMonth?: Date;
  selectedDate?: Date;
}

export const getStartMonth = ({
  startMonth,
  selectedDate,
}: GetStartMonthProps) => {
  if (startMonth) return startMonth;
  const twoYearsAgo = addYears(new Date(), -2);

  if (selectedDate) {
    return new Date(
      Math.min(addYears(selectedDate, -2).getTime(), twoYearsAgo.getTime())
    );
  }

  return twoYearsAgo;
};

interface GetEndMonthProps {
  endMonth?: Date;
  selectedDate?: Date;
}

export const getEndMonth = ({ endMonth, selectedDate }: GetEndMonthProps) => {
  if (endMonth) return endMonth;
  const twoYearsFromNow = addYears(new Date(), 2);

  if (selectedDate) {
    return new Date(
      Math.max(addYears(selectedDate, 2).getTime(), twoYearsFromNow.getTime())
    );
  }

  return twoYearsFromNow;
};
