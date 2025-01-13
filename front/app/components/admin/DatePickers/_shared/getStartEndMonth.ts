import { addYears } from 'date-fns';

interface GetEndMonthProps {
  endMonth?: Date;
  selectedDate?: Date;
}

export const getEndMonth = ({ endMonth, selectedDate }: GetEndMonthProps) => {
  if (endMonth) return endMonth;
  const tenYearsFromNow = addYears(new Date(), 10);

  if (selectedDate) {
    return new Date(
      Math.max(addYears(selectedDate, 10).getTime(), tenYearsFromNow.getTime())
    );
  }

  return tenYearsFromNow;
};
