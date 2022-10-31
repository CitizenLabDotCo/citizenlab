import moment, { Moment } from 'moment';

export const getSensibleResolution = (
  startAtMoment: Moment | null,
  endAtMoment: Moment | null
) => {
  const timeDiff =
    endAtMoment &&
    startAtMoment &&
    moment.duration(endAtMoment.diff(startAtMoment));

  const resolution = timeDiff
    ? timeDiff.asMonths() > 6
      ? 'month'
      : timeDiff.asWeeks() > 4
      ? 'week'
      : 'day'
    : 'month';

  return resolution;
};
