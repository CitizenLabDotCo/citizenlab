import { addDays, differenceInCalendarDays } from 'date-fns';

import { ClosedDateRange, DateRange } from '../typings';

import { allAreClosedDateRanges, isClosedDateRange } from './utils';

// Generate the current view of the calendar
interface GenerateViewParams {
  previouslySelectedRange: DateRange;
  disabledRanges: DateRange[];
  currentlySelectedDate?: Date;
}

// This function does not do validation- it assumes that the input is valid
// The validation happens somewhere else
export const generateModifiers = ({
  previouslySelectedRange,
  disabledRanges,
  currentlySelectedDate,
}: GenerateViewParams) => {
  if (!currentlySelectedDate) {
    return generateIdleView({ previouslySelectedRange, disabledRanges });
  } else {
    return generateSelectingView({ disabledRanges, currentlySelectedDate });
  }
};

interface GenerateIdleViewParams {
  previouslySelectedRange: DateRange;
  disabledRanges: DateRange[];
}

const generateIdleView = ({
  previouslySelectedRange,
  disabledRanges,
}: GenerateIdleViewParams) => {
  // Funky hack to not have to deal with the case where disabledRanges is empty
  const lastDisabledRange = disabledRanges[disabledRanges.length - 1] as
    | DateRange
    | undefined;

  const disabledRangesWithoutLastOne = disabledRanges.filter(
    (range) => range !== lastDisabledRange
  );

  // We don't really need to do any validation here, because the input is assumed to be valid.
  // But since we need to do a type check here anyway we might as well
  if (!allAreClosedDateRanges(disabledRangesWithoutLastOne)) {
    throw new Error('All disabled ranges except the last one must be closed');
  }

  if (!isClosedDateRange(previouslySelectedRange)) {
    if (lastDisabledRange === undefined) {
      return {
        isSelectedStart: previouslySelectedRange.from,
        ...generateGradient(previouslySelectedRange.from, 'isSelectedGradient'),
      };
    }

    if (!isClosedDateRange(lastDisabledRange)) {
      // Assuming this is all valid: the selected range must be at least two days after the
      // last disabled range.
      // So we extend the last disabled range until one day before the previously selected range
      const newLastRange = {
        from: lastDisabledRange.from,
        to: addDays(previouslySelectedRange.from, -1),
      };
      const newDisabledRanges = [...disabledRangesWithoutLastOne, newLastRange];

      return {
        ...generateDisabledRanges(newDisabledRanges),
        isSelectedStart: previouslySelectedRange.from,
        // We then make sure that the selected range gets a gradient to show it's open-ende
        ...generateGradient(previouslySelectedRange.from, 'isSelectedGradient'),
      };
    }

    if (isClosedDateRange(lastDisabledRange)) {
      // In this case, we only have to worry about the gradient
      // We will again do the type check
      if (!allAreClosedDateRanges(disabledRanges)) {
        throw new Error(
          'All disabled ranges except the last one must be closed'
        );
      }

      return {
        ...generateDisabledRanges(disabledRanges),
        isSelectedStart: previouslySelectedRange.from,
        ...generateGradient(previouslySelectedRange.from, 'isSelectedGradient'),
      };
    }
  }

  if (isClosedDateRange(previouslySelectedRange)) {
    if (lastDisabledRange === undefined) {
      return getSelection(previouslySelectedRange);
    }

    if (!isClosedDateRange(lastDisabledRange)) {
      // In this case, we just have to generate the gradient
      // for the last disabled range
      const disabledRanges = generateDisabledRanges(
        disabledRangesWithoutLastOne
      );
      return {
        isDisabled: disabledRanges.isDisabled,
        isDisabledStart: [
          ...disabledRanges.isDisabledStart,
          lastDisabledRange.from,
        ],
        isDisabledEnd: disabledRanges.isDisabledEnd,
        ...generateGradient(lastDisabledRange.from, 'isDisabledGradient'),
        ...getSelection(previouslySelectedRange),
      };
    }

    if (isClosedDateRange(lastDisabledRange)) {
      // The simplest case: nothing is open-ended
      // We will again do the type check
      if (!allAreClosedDateRanges(disabledRanges)) {
        throw new Error(
          'All disabled ranges except the last one must be closed'
        );
      }

      return {
        ...generateDisabledRanges(disabledRanges),
        ...getSelection(previouslySelectedRange),
      };
    }
  }

  // Unreachable
  throw new Error('Unreachable');
};

interface GenerateSelectingViewParams {
  disabledRanges: DateRange[];
  currentlySelectedDate: Date;
}

const generateSelectingView = ({
  disabledRanges,
  currentlySelectedDate,
}: GenerateSelectingViewParams) => {
  const lastDisabledRange = disabledRanges[disabledRanges.length - 1] as
    | DateRange
    | undefined;
  const disabledRangesWithoutLastOne = disabledRanges.filter(
    (range) => range !== lastDisabledRange
  );

  // We don't really need to do any validation here, because the input is assumed to be valid.
  // But since we need to do a type check here anyway we might as well
  if (!allAreClosedDateRanges(disabledRangesWithoutLastOne)) {
    throw new Error('All disabled ranges except the last one must be closed');
  }

  const getCurrentlySelectedDateIsAfterLastDisabledRange = () => {
    if (lastDisabledRange === undefined) {
      return true;
    }

    return isClosedDateRange(lastDisabledRange)
      ? currentlySelectedDate > lastDisabledRange.to
      : currentlySelectedDate > lastDisabledRange.from;
  };

  const currentlySelectedDateIsAfterLastDisabledRange =
    getCurrentlySelectedDateIsAfterLastDisabledRange();

  if (!currentlySelectedDateIsAfterLastDisabledRange) {
    if (lastDisabledRange === undefined) {
      return {
        isCurrentlySelected: currentlySelectedDate,
      };
    }

    if (!isClosedDateRange(lastDisabledRange)) {
      const disabledRanges = generateDisabledRanges(
        disabledRangesWithoutLastOne
      );

      return {
        isDisabled: disabledRanges.isDisabled,
        isDisabledStart: [
          ...disabledRanges.isDisabledStart,
          lastDisabledRange.from,
        ],
        isDisabledEnd: disabledRanges.isDisabledEnd,
        isCurrentlySelected: currentlySelectedDate,
      };
    }

    if (isClosedDateRange(lastDisabledRange)) {
      // We will again do the type check
      if (!allAreClosedDateRanges(disabledRanges)) {
        throw new Error(
          'All disabled ranges except the last one must be closed'
        );
      }

      return {
        ...generateDisabledRanges(disabledRanges),
        isCurrentlySelected: currentlySelectedDate,
      };
    }
  }

  if (currentlySelectedDateIsAfterLastDisabledRange) {
    // TODO: Implement this
  }

  throw new Error('Unreachable');
};

const generateDisabledRanges = (disabledRanges: ClosedDateRange[]) => {
  return {
    isDisabled: disabledRanges.reduce((acc, range) => {
      const diff = differenceInCalendarDays(range.to, range.from);
      if (diff < 2) return acc;
      if (diff === 2) return [...acc, addDays(range.from, 1)];
      return [
        ...acc,
        {
          from: addDays(range.from, 1),
          to: addDays(range.to, -1),
        },
      ];
    }, []),
    isDisabledStart: disabledRanges.map((range) => range.from),
    isDisabledEnd: disabledRanges.map((range) => range.to),
  };
};

const generateGradient = (startDate: Date, prefix: string) => ({
  [`${prefix}_one`]: addDays(startDate, 1),
  [`${prefix}_two`]: addDays(startDate, 2),
  [`${prefix}_three`]: addDays(startDate, 3),
});

const getSelection = ({ from, to }: ClosedDateRange) => {
  const diff = differenceInCalendarDays(to, from);
  const isSelected = getIsSelected({ from, to }, diff);

  return {
    isSelected,
    isSelectedStart: from,
    isSelectedEnd: to,
  };
};

const getIsSelected = ({ from, to }: ClosedDateRange, diff: number) => {
  if (diff < 2) return undefined;
  if (diff === 2) return addDays(from, 1);
  return {
    from: addDays(from, 1),
    to: addDays(to, -1),
  };
};
