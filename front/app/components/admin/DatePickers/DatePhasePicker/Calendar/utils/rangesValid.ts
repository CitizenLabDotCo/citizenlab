import { differenceInDays } from 'date-fns';

import { DateRange, ClosedDateRange } from '../../typings';

import { allAreClosedDateRanges, isClosedDateRange } from './utils';

type Validity =
  | {
      valid: true;
      reason: undefined;
    }
  | {
      valid: false;
      reason: string;
    };

/**
 * This function validates that the combination of selectedRange
 * and disabledRanges is valid.
 * With 'valid' we mean a valid state for the component-
 * this is not necessarily a valid state for the backend.
 * For example, you might have picked a start date between two disabled ranges,
 * at which point you still need to select an end date for the phase to make sense.
 * If this data would be sent to the BE, it would be invalid.
 * But it is a valid state for the date picker to be in (temporarily).
 */
export const rangesValid = (
  { from, to }: Partial<DateRange>,
  disabledRanges: DateRange[]
): Validity => {
  // First, make sure selectedRange itself is valid
  if (from === undefined && to !== undefined) {
    return {
      valid: false,
      reason:
        'selectedRange.from cannot be undefined if selectedRange.to is defined',
    };
  }

  if (from !== undefined && to !== undefined && from > to) {
    return {
      valid: false,
      reason: 'selectedRange.from cannot be after selectedRange.to',
    };
  }

  // Second, make sure disabledRanges itself is valid
  if (disabledRanges.length === 0) {
    return { valid: true, reason: undefined };
  }

  if (!validRangeSequence(disabledRanges)) {
    return {
      valid: false,
      reason: 'disabledRanges invalid',
    };
  }

  // Third, make sure selectedRange and disabledRanges are valid together
  if (from === undefined) {
    return { valid: true, reason: undefined };
  }

  if (allAreClosedDateRanges(disabledRanges)) {
    if (to === undefined) {
      const fromOverlapsWithAnyDisabledRange = disabledRanges.some(
        (disabledRange) => {
          return from >= disabledRange.from && from <= disabledRange.to;
        }
      );

      if (fromOverlapsWithAnyDisabledRange) {
        return {
          valid: false,
          reason: 'selectedRange.from overlaps with a disabledRange',
        };
      } else {
        return { valid: true, reason: undefined };
      }
    } else {
      const combinedRanges = [...disabledRanges, { from, to }].sort(
        (a, b) => a.from.getTime() - b.from.getTime()
      );

      if (validRangeSequence(combinedRanges)) {
        return { valid: true, reason: undefined };
      }

      return {
        valid: false,
        reason: 'selectedRange and disabledRanges invalid together',
      };
    }
  } else {
    const fromIsLast = from >= disabledRanges[disabledRanges.length - 1].from;

    if (fromIsLast) {
      return {
        valid: false,
        reason:
          'selectedRange cannot be last if disabledRanges ends with an open range',
      };
    }

    return { valid: true, reason: undefined };
  }
};

const validRangeSequence = (ranges: DateRange[]) => {
  for (let i = 0; i < ranges.length - 1; i++) {
    const currentRange = ranges[i];
    const nextRange = ranges[i + 1];

    if (!isClosedDateRange(currentRange)) {
      return false;
    }

    if (!validDifference(currentRange, 0)) {
      return false;
    }

    // TODO:
    // this really should be the comment out line, but for some insane reason
    // date-fns thinks that the difference between
    // 2024-10-28T00:00:00.000Z
    // and
    // 2024-10-27T00:00:00.000Z
    // is zero days. Going to fix this later.
    // if (!validDifference({ from: currentRange.to, to: nextRange.from }, 1)) {
    if (!validDifference({ from: currentRange.to, to: nextRange.from }, 0)) {
      return false;
    }
  }

  return true;
};

const validDifference = (range: ClosedDateRange, requiredDiff: number) => {
  const diff = differenceInDays(range.to, range.from);
  return diff >= requiredDiff;
};
