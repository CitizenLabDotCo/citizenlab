import {
  differenceInDays,
  addDays,
  isSameDay,
  differenceInHours,
  startOfDay,
} from 'date-fns';

import { DateRange } from 'components/admin/DatePickers/_shared/typings';

import { ClosedDateRange } from '../../typings';

import { rangesValid } from './rangesValid';
import { allAreClosedDateRanges } from './utils';

interface GenerateModifiersParams {
  selectedRange: Partial<DateRange>;
  disabledRanges: DateRange[];
}

export const generateModifiers = ({
  selectedRange,
  disabledRanges,
}: GenerateModifiersParams) => {
  const { valid, reason } = rangesValid(selectedRange, disabledRanges);

  if (!valid) {
    throw new Error(reason);
  }

  const selectedModifiers = generateSelectedModifiers({
    selectedRange,
    disabledRanges,
  });

  const disabledModifiers = generateDisabledModifiers(disabledRanges);

  const boundaryModifiers = generateBoundaryModifiers({
    selectedRange,
    disabledRanges,
  });
  const fullOccupiedModifiers =
    generateFullOccupiedDayModifiers(disabledRanges);

  const noTimeAvailableModifires =
    generateNoTimeAvailableModifiers(disabledRanges);

  return {
    ...selectedModifiers,
    ...disabledModifiers,
    ...boundaryModifiers,
    ...fullOccupiedModifiers,
    ...noTimeAvailableModifires,
  };
};

const generateSelectedModifiers = ({
  selectedRange: { from, to },
  disabledRanges,
}: GenerateModifiersParams) => {
  if (from === undefined) {
    return {};
  }

  if (
    to &&
    from.getHours() === 0 &&
    from.getMinutes() === 0 &&
    to.getHours() === 0 &&
    to.getMinutes() === 0 &&
    differenceInHours(to, from) === 24
  ) {
    return {
      isSelectedSingleDay: [from],
    };
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
    return generateClosedDisabledRanges(disabledRanges);
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
      const closedDisabledRanges = generateClosedDisabledRanges(
        disabledRangesWithoutLast
      );

      return {
        isDisabledStart: [
          ...(closedDisabledRanges.isDisabledStart || []),
          lastDisabledRange.from,
        ],
        isDisabledMiddle: closedDisabledRanges.isDisabledMiddle,
        isDisabledEnd: closedDisabledRanges.isDisabledEnd,
        isDisabledSingle: closedDisabledRanges.isDisabledSingle,
        ...isDisabledGradient,
      };
    }
  }
};

const generateMiddleRange = ({ from, to }: ClosedDateRange) => {
  // Calculate days including partial days
  const fromDate = new Date(from);
  fromDate.setHours(0, 0, 0, 0);
  const toDate = new Date(to);
  toDate.setHours(0, 0, 0, 0);

  const diff = differenceInDays(toDate, fromDate);

  if (diff < 2) return undefined;
  if (diff === 2) return addDays(fromDate, 1);
  return {
    from: addDays(fromDate, 1),
    to: addDays(toDate, -1),
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

const generateBoundaryModifiers = ({
  selectedRange: { from, to },
  disabledRanges,
}: GenerateModifiersParams) => {
  const disabledEndSelectedStart: Date[] = [];
  const disabledStartSelectedEnd: Date[] = [];
  const disabledEndDisabledStart: Date[] = [];

  for (const range of disabledRanges) {
    if (from && range.to && isSameDay(range.to, from)) {
      disabledEndSelectedStart.push(from);
    }
    if (to && isSameDay(range.from, to)) {
      disabledStartSelectedEnd.push(to);
    }
  }

  // Detect boundaries between two disabled ranges on the same day
  for (let i = 0; i < disabledRanges.length - 1; i++) {
    const current = disabledRanges[i];
    const next = disabledRanges[i + 1];
    if (current.to && isSameDay(current.to, next.from)) {
      disabledEndDisabledStart.push(current.to);
    }
  }

  return {
    ...(disabledEndSelectedStart.length > 0
      ? { isBoundaryDisabledEndSelectedStart: disabledEndSelectedStart }
      : {}),
    ...(disabledStartSelectedEnd.length > 0
      ? { isBoundaryDisabledStartSelectedEnd: disabledStartSelectedEnd }
      : {}),
    ...(disabledEndDisabledStart.length > 0
      ? { isBoundaryDisabledEndDisabledStart: disabledEndDisabledStart }
      : {}),
  };
};

const generateClosedDisabledRanges = (disabledRanges: ClosedDateRange[]) => {
  const disabledRangesWithoutSingleDayRanges: ClosedDateRange[] = [];
  const singleDayRanges: ClosedDateRange[] = [];

  for (const range of disabledRanges) {
    if (isSameDay(range.from, range.to)) {
      singleDayRanges.push(range);
    } else {
      disabledRangesWithoutSingleDayRanges.push(range);
    }
  }

  if (
    disabledRangesWithoutSingleDayRanges.length === 0 &&
    singleDayRanges.length === 0
  ) {
    return {};
  }

  if (
    disabledRangesWithoutSingleDayRanges.length === 0 &&
    singleDayRanges.length > 0
  ) {
    return {
      isDisabledSingle: singleDayRanges.map(({ from }) => from),
    };
  }

  if (
    disabledRangesWithoutSingleDayRanges.length > 0 &&
    singleDayRanges.length === 0
  ) {
    return {
      isDisabledStart: disabledRangesWithoutSingleDayRanges.map(
        ({ from }) => from
      ),
      isDisabledMiddle: generateDisabledMiddleRange(
        disabledRangesWithoutSingleDayRanges
      ),
      isDisabledEnd: disabledRangesWithoutSingleDayRanges.map(({ to }) => to),
    };
  }

  return {
    isDisabledSingle: singleDayRanges.map(({ from }) => from),
    isDisabledStart: disabledRangesWithoutSingleDayRanges.map(
      ({ from }) => from
    ),
    isDisabledMiddle: generateDisabledMiddleRange(
      disabledRangesWithoutSingleDayRanges
    ),
    isDisabledEnd: disabledRangesWithoutSingleDayRanges.map(({ to }) => to),
  };
};

// max 1 start and 1 end per day
const generateFullOccupiedDayModifiers = (disabledRanges: DateRange[]) => {
  const fullOccupiedDays: Date[] = [];
  const allDays = new Set<number>();

  for (const range of disabledRanges) {
    allDays.add(startOfDay(range.from).getTime());
    if (range.to) allDays.add(startOfDay(range.to).getTime());
  }

  for (const dayTs of allDays) {
    let startCount = 0;
    let endCount = 0;
    const day = new Date(dayTs);

    for (const range of disabledRanges) {
      if (isSameDay(range.from, day)) startCount += 1;
      if (range.to && isSameDay(range.to, day)) endCount += 1;
    }

    if (startCount >= 1 && endCount >= 1) {
      fullOccupiedDays.push(day);
    }
  }

  return {
    ...(fullOccupiedDays.length > 0
      ? { isFullOccupiedDay: fullOccupiedDays }
      : {}),
  };
};

// if the phase start at 00:00 Or the end is at 11:59 ( there will be no more time available on that day)
const generateNoTimeAvailableModifiers = (disabledRanges: DateRange[]) => {
  const noTimeAvailableDays: Date[] = [];
  const allDays = new Set<number>();

  for (const range of disabledRanges) {
    allDays.add(startOfDay(range.from).getTime());
    if (range.to) allDays.add(startOfDay(range.to).getTime());
  }

  for (const dayTs of allDays) {
    const day = new Date(dayTs);

    const isNoTime = disabledRanges.some(
      (range) =>
        (isSameDay(range.from, day) &&
          range.from.getHours() === 0 &&
          range.from.getMinutes() === 0) ||
        (range.to &&
          isSameDay(range.to, day) &&
          range.to.getHours() === 23 &&
          range.to.getMinutes() === 59)
    );

    if (isNoTime) {
      noTimeAvailableDays.push(day);
    }
  }

  return {
    ...(noTimeAvailableDays.length > 0
      ? { isNoTimeAvailable: noTimeAvailableDays }
      : {}),
  };
};
