import { DateRange } from './typings';

export const getNextSelectedRange = (
  day: Date,
  selectedRange: DateRange,
  disabledRanges: DateRange[]
) => {
  // NOTE: This function won't fire if the day is disabled, so we don't
  // need to check if the day is disabled / overlaps with another range.

  // We will treat open-ended ranges as one-day ranges.
  const currentSelectionIsOneDayRange = selectedRange.to
    ? selectedRange.from.getTime() === selectedRange.to.getTime()
    : true;

  const clickedDayIsBeforeSelectedRange = day < selectedRange.from;

  if (currentSelectionIsOneDayRange && clickedDayIsBeforeSelectedRange) {
    // If the user has currently selected a one-day range and they click
    // on a day before that range, we set the range to be a one-day range
    // on the clicked day.
    return { from: day, to: day };
  }

  if (currentSelectionIsOneDayRange && !clickedDayIsBeforeSelectedRange) {
    // First, we check if the user has clicked on the one-day range. In this
    // case, we do nothing.
    if (day.getTime() === selectedRange.from.getTime()) return;

    // Next, we check if there is a disabled range after the one-day range.
    // If there is not, we can safely extend the one-day range to the clicked day.
    const nextDisabledRange = findNextDisabledRange(
      selectedRange,
      disabledRanges
    );

    if (nextDisabledRange === undefined) {
      return { from: selectedRange.from, to: day };
    }

    // Then, if there is a next range, we check if the clicked day is before
    // the start of the next range. If it is, we can safely extend the one-day
    // range to a multiple-day range.
    if (day < nextDisabledRange.from) {
      return { from: selectedRange.from, to: day };
    }

    // Finally, if the clicked day is after the start of the next range, we
    // set it as a one-day range on the clicked day.
    return { from: day, to: day };
  }

  // If the selection is already a multi-day range, we simply reset
  // the range to a one-day range on the clicked day.
  return { from: day, to: day };
};

const findNextDisabledRange = (
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
