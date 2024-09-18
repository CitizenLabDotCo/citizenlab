import { DateRange } from './typings';

export const getNextRange = (
  selectedRange: DateRange,
  disabledRanges: DateRange[]
): DateRange | undefined => {
  const sortedRanges = [...disabledRanges].sort(
    (a, b) => a.from.getTime() - b.from.getTime()
  );

  return sortedRanges.find(
    (range) => range.from.getTime() > selectedRange.from.getTime()
  );
};
