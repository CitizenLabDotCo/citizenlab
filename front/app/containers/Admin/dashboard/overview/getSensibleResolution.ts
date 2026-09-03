import { differenceInCalendarDays } from 'date-fns';

export const getSensibleResolution = (
  startAtMoment: Date | null,
  endAtMoment: Date | null
) => {
  const rangeInDays =
    endAtMoment &&
    startAtMoment &&
    differenceInCalendarDays(endAtMoment, startAtMoment);

  // Thresholds preserved from the moment version: >6 months, then >4 weeks.
  const resolution = rangeInDays
    ? rangeInDays / 30.436875 > 6
      ? 'month'
      : rangeInDays / 7 > 4
      ? 'week'
      : 'day'
    : 'month';

  return resolution;
};
