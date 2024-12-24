import moment, { Moment } from 'moment';

import { IResolution } from 'components/admin/ResolutionControl';

import { momentToIsoDate } from 'utils/dateUtils';

type ProjectFilter = { [key: string]: string };
type EmptyObject = Record<string, unknown>;

export const getProjectFilter = (
  filter: string,
  projectId: string | undefined
): ProjectFilter | EmptyObject => {
  return projectId ? { [`${filter}.id`]: projectId } : {};
};

const formatDate = (dateString: string) =>
  moment(dateString).format('yyyy-MM-DD');

type DateFilter = {
  [key: string]: {
    from: string;
    to: string;
  };
};

export const getDateFilter = (
  filter: string,
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null | undefined
): DateFilter | EmptyObject => {
  const startAt = startAtMoment?.local().format('YYYY-MM-DD');
  const endAt = endAtMoment?.local().format('YYYY-MM-DD');

  if (!startAt && !endAt) return {};

  return {
    [`${filter}.date`]: {
      ...(startAt ? { from: formatDate(startAt) } : {}),
      ...(endAt ? { to: formatDate(endAt) } : {}),
    },
  };
};

type Interval = 'month' | 'week' | 'date';

const RESOLUTION_TO_INTERVAL: Record<IResolution, Interval> = {
  month: 'month',
  week: 'week',
  day: 'date',
};

export const getInterval = (resolution: IResolution) =>
  RESOLUTION_TO_INTERVAL[resolution];

const getLastPeriod = (resolution: IResolution) => {
  if (resolution === 'month') {
    return moment().subtract({ days: 30 }).format('YYYY-MM-DD');
  }

  if (resolution === 'week') {
    return moment().subtract({ days: 7 }).format('YYYY-MM-DD');
  }

  return moment().subtract({ days: 1 }).format('YYYY-MM-DD');
};

export const getComparedTimeRange = (startAt?: string, endAt?: string) => {
  if (!startAt || !endAt) return {};

  const startAtMoment = moment(startAt, 'YYYY-MM-DD');
  const endAtMoment = moment(endAt, 'YYYY-MM-DD');

  const days = endAtMoment.diff(startAtMoment, 'days');

  const prevEndAtMoment = startAtMoment.clone().subtract(1, 'days');
  const prevStartAtMoment = prevEndAtMoment.clone().subtract(days, 'days');

  return {
    compare_start_at: momentToIsoDate(prevStartAtMoment),
    compare_end_at: momentToIsoDate(prevEndAtMoment),
  };
};

export const getComparedPeriod = (resolution: IResolution) => {
  const today = moment().format('YYYY-MM-DD');
  const lastPeriod = getLastPeriod(resolution);

  return {
    compare_start_at: lastPeriod,
    compare_end_at: today,
  };
};
