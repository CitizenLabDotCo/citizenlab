import { DateRange } from '../../../_shared/typings';
import { ClosedDateRange } from '../../typings';

export const isClosedDateRange = (range: DateRange): range is ClosedDateRange =>
  !!range.to;

export const allAreClosedDateRanges = (
  ranges: DateRange[]
): ranges is ClosedDateRange[] => ranges.every(isClosedDateRange);
