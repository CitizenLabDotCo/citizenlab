import { DateRange } from './typings';

export const isSelectedRangeOpenEnded = (
  { from, to }: Partial<DateRange>,
  disabledRanges: DateRange[]
) => {
  if (from !== undefined && to === undefined) {
    const lastDisabledRange = disabledRanges[disabledRanges.length - 1] as
      | DateRange
      | undefined;

    if (lastDisabledRange === undefined) {
      return true;
    }

    return from.getTime() > lastDisabledRange.from.getTime();
  }

  return false;
};
