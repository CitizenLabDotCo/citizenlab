import { differenceInCalendarDays, addDays } from 'date-fns';

import { DateRange, ClosedDateRange } from '../../typings';

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
      isSelectedMiddle: generateMiddleRange({ from, to }),
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

      const selectedRangeIsAfterAllDisabledRanges =
        from.getTime() > highestToDate;

      if (selectedRangeIsAfterAllDisabledRanges) {
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
    return {
      isDisabledStart: disabledRanges.map(({ from }) => from),
      isDisabledMiddle: generateDisabledMiddleRange(disabledRanges),
      isDisabledEnd: disabledRanges.map(({ to }) => to),
    };
  } else {
    const lastDisabledRange = disabledRanges[disabledRanges.length - 1];
    const disabledRangesWithoutLast = disabledRanges.slice(0, -1);

    // This should not be possible, but we need this for the type check
    if (!allAreClosedDateRanges(disabledRangesWithoutLast)) {
      throw new Error('Invalid props');
    }

    const isDisabledGradient = {
      isDisabledGradient_one: addDays(lastDisabledRange.from, 1),
      isDisabledGradient_two: addDays(lastDisabledRange.from, 2),
      isDisabledGradient_three: addDays(lastDisabledRange.from, 3),
    };

    if (disabledRangesWithoutLast.length === 0) {
      return {
        isDisabledStart: [lastDisabledRange.from],
        ...isDisabledGradient,
      };
    } else {
      return {
        isDisabledStart: [
          ...disabledRangesWithoutLast.map(({ from }) => from),
          lastDisabledRange.from,
        ],
        isDisabledMiddle: generateDisabledMiddleRange(
          disabledRangesWithoutLast
        ),
        isDisabledEnd: disabledRangesWithoutLast.map(({ to }) => to),
        ...isDisabledGradient,
      };
    }
  }
};

const generateMiddleRange = ({ from, to }: ClosedDateRange) => {
  const diff = differenceInCalendarDays(to, from);
  if (diff < 2) return undefined;
  if (diff === 2) return addDays(from, 1);
  return {
    from: addDays(from, 1),
    to: addDays(to, -1),
  };
};

const generateIsSelectedGradient = (isSelectedStart: Date) => ({
  isSelectedStart,
  isSelectedGradient_one: addDays(isSelectedStart, 1),
  isSelectedGradient_two: addDays(isSelectedStart, 2),
  isSelectedGradient_three: addDays(isSelectedStart, 3),
});

const generateDisabledMiddleRange = (disabledRanges: ClosedDateRange[]) => {
  return disabledRanges.reduce((acc, range) => {
    const middleRange = generateMiddleRange(range);
    return middleRange ? [...acc, middleRange] : acc;
  }, []);
};
