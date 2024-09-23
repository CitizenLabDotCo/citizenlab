import { addDays } from 'date-fns';

import { ClosedDateRange, DateRange } from './typings';

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
  const lastDisabledRange = disabledRanges[disabledRanges.length - 1];
  const disabledRangesWithoutLastOne = disabledRanges.filter(
    (range) => range !== lastDisabledRange
  );

  // We don't really need to do any validation here, because the input is assumed to be valid.
  // But since we need to do a type check here anyway we might as well
  if (!allAreClosedDateRanges(disabledRangesWithoutLastOne)) {
    throw new Error('All disabled ranges except the last one must be closed');
  }

  if (!isClosedDateRange(previouslySelectedRange)) {
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
        isDisabled: newDisabledRanges,
        isDisabledStart: newDisabledRanges.map((range) => range.from),
        isDisabledEnd: newDisabledRanges.map((range) => range.to),
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
        isDisabled: disabledRanges,
        isDisabledStart: disabledRanges.map((range) => range.from),
        isDisabledEnd: disabledRanges.map((range) => range.to),
        isSelectedStart: previouslySelectedRange.from,
        ...generateGradient(previouslySelectedRange.from, 'isSelectedGradient'),
      };
    }
  }

  if (isClosedDateRange(previouslySelectedRange)) {
    if (!isClosedDateRange(lastDisabledRange)) {
      // In this case, we just have to generate the gradient
      // for the last disabled range
      return {
        isDisabled: disabledRangesWithoutLastOne,
        isDisabledStart: [
          ...disabledRangesWithoutLastOne.map((range) => range.from),
          lastDisabledRange.from,
        ],
        isDisabledEnd: disabledRangesWithoutLastOne.map((range) => range.to),
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
        isDisabled: disabledRanges,
        isDisabledStart: disabledRanges.map((range) => range.from),
        isDisabledEnd: disabledRanges.map((range) => range.to),
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
  const lastDisabledRange = disabledRanges[disabledRanges.length - 1];
  const disabledRangesWithoutLastOne = disabledRanges.filter(
    (range) => range !== lastDisabledRange
  );

  // We don't really need to do any validation here, because the input is assumed to be valid.
  // But since we need to do a type check here anyway we might as well
  if (!allAreClosedDateRanges(disabledRangesWithoutLastOne)) {
    throw new Error('All disabled ranges except the last one must be closed');
  }

  const currentlySelectedDateIsAfterLastDisabledRange = isClosedDateRange(
    lastDisabledRange
  )
    ? currentlySelectedDate > lastDisabledRange.to
    : currentlySelectedDate > lastDisabledRange.from;

  if (currentlySelectedDateIsAfterLastDisabledRange) {
    return {};
  }

  if (!currentlySelectedDateIsAfterLastDisabledRange) {
    if (!isClosedDateRange(lastDisabledRange)) {
      return {
        isDisabled: disabledRangesWithoutLastOne,
        isDisabledStart: [
          ...disabledRangesWithoutLastOne.map((range) => range.from),
          lastDisabledRange.from,
        ],
        isDisabledEnd: disabledRangesWithoutLastOne.map((range) => range.to),
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
        isDisabled: disabledRanges,
        isDisabledStart: disabledRanges.map((range) => range.from),
        isDisabledEnd: disabledRanges.map((range) => range.to),
        isCurrentlySelected: currentlySelectedDate,
      };
    }
  }

  throw new Error('Unreachable');
};

const isClosedDateRange = (range: DateRange): range is ClosedDateRange =>
  !!range.to;

const allAreClosedDateRanges = (
  ranges: DateRange[]
): ranges is ClosedDateRange[] => ranges.every(isClosedDateRange);

const generateGradient = (startDate: Date, prefix: string) => ({
  [`${prefix}_one`]: addDays(startDate, 1),
  [`${prefix}_two`]: addDays(startDate, 2),
  [`${prefix}_three`]: addDays(startDate, 3),
});

const getSelection = (previouslySelectedRange: ClosedDateRange) => ({
  isSelected: {
    from: addDays(previouslySelectedRange.from, 1),
    to: addDays(previouslySelectedRange.to, -1),
  },
  isSelectedStart: previouslySelectedRange.from,
  isSelectedEnd: previouslySelectedRange.to,
});
