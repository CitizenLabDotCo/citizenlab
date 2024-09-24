import { differenceInCalendarDays, addDays } from 'date-fns';

import { DateRange, ClosedDateRange } from '../typings';

import { allAreClosedDateRanges } from './utils';

interface GenerateModifiersParams {
  selectedRange: Partial<DateRange>;
  disabledRanges: DateRange[];
}

export const generateModifiers = ({
  selectedRange,
  disabledRanges,
}: GenerateModifiersParams) => {
  const selectedModifiers = generateSelectedModifiers({
    selectedRange,
    disabledRanges,
  });

  const disabledModifiers = generateDisabledModifiers(disabledRanges);

  return {
    ...selectedModifiers,
    ...disabledModifiers,
  };
};

const generateSelectedModifiers = ({
  selectedRange: { from, to },
  disabledRanges,
}: GenerateModifiersParams) => {
  if (from === undefined) {
    return {};
  }

  if (to !== undefined) {
    return {
      isSelectedStart: from,
      isSelectedMiddle: generateIsSelectedMiddle({ from, to }),
      isSelectedEnd: to,
    };
  } else {
    if (disabledRanges.length === 0) {
      return generateIsSelectedGradient(from);
    }

    if (allAreClosedDateRanges(disabledRanges)) {
      const highestToDate = Math.max(
        ...disabledRanges.map(({ to }) => to.getTime())
      );

      if (from.getTime() > highestToDate) {
        return generateIsSelectedGradient(from);
      } else {
        return {
          isSelectedSingleDay: from,
        };
      }
    } else {
      // If this is the case, the only possibility is that
      // the last disabled range is open, and that therefore we
      // must be before the start of that phase with a single
      // day selected.
      // Otherwise the props are invalid.
      return {
        isSelectedSingleDay: from,
      };
    }
  }
};

const generateDisabledModifiers = (disabledRanges: DateRange[]) => {
  if (disabledRanges.length === 0) {
    return {};
  }

  if (allAreClosedDateRanges(disabledRanges)) {
    return {}; // TODO
  } else {
    return {}; // TODO
  }
};

const generateIsSelectedMiddle = (selectedRange: ClosedDateRange) => {
  const diff = differenceInCalendarDays(selectedRange.to, selectedRange.from);
  if (diff < 2) return undefined;
  if (diff === 2) return addDays(selectedRange.from, 1);
  return {
    from: addDays(selectedRange.from, 1),
    to: addDays(selectedRange.to, -1),
  };
};

const generateIsSelectedGradient = (isSelectedStart: Date) => ({
  isSelectedStart,
  isSelectedGradient_one: addDays(isSelectedStart, 1),
  isSelectedGradient_two: addDays(isSelectedStart, 2),
  isSelectedGradient_three: addDays(isSelectedStart, 3),
});
