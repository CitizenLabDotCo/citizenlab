import { differenceInDays, format, parseISO, subDays } from 'date-fns';

import { IResolution } from 'components/admin/ResolutionControl';

type ProjectFilter = { [key: string]: string };
type EmptyObject = Record<string, unknown>;

export const getProjectFilter = (
  filter: string,
  projectId: string | undefined
): ProjectFilter | EmptyObject => {
  return projectId ? { [`${filter}.id`]: projectId } : {};
};

// parseISO, not `new Date()`: a bare "2026-03-22" is UTC midnight to the Date
// constructor but local midnight to parseISO — and local is what moment did.
const formatDate = (dateString: string) =>
  format(parseISO(dateString), 'yyyy-MM-dd');

type DateFilter = {
  [key: string]: {
    from: string;
    to: string;
  };
};

export const getDateFilter = (
  filter: string,
  startAtMoment: Date | null | undefined,
  endAtMoment: Date | null | undefined
): DateFilter | EmptyObject => {
  // Deliberately the browser's zone, matching moment's `.local()` — these are
  // filter bounds the user picked on their own calendar, not tenant-zone
  // values. Plain date-fns `format` is local; `toIsoDate` would not be.
  const startAt = startAtMoment
    ? format(startAtMoment, 'yyyy-MM-dd')
    : undefined;
  const endAt = endAtMoment ? format(endAtMoment, 'yyyy-MM-dd') : undefined;

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
    return format(subDays(new Date(), 30), 'yyyy-MM-dd');
  }

  if (resolution === 'week') {
    return format(subDays(new Date(), 7), 'yyyy-MM-dd');
  }

  return format(subDays(new Date(), 1), 'yyyy-MM-dd');
};

export const getComparedTimeRange = (startAt?: string, endAt?: string) => {
  if (!startAt || !endAt) return {};

  const start = parseISO(startAt);
  const end = parseISO(endAt);

  const days = differenceInDays(end, start);

  // The immediately preceding window of equal length, ending the day before.
  const prevEnd = subDays(start, 1);
  const prevStart = subDays(prevEnd, days);

  return {
    compare_start_at: format(prevStart, 'yyyy-MM-dd'),
    compare_end_at: format(prevEnd, 'yyyy-MM-dd'),
  };
};

export const getComparedPeriod = (resolution: IResolution) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const lastPeriod = getLastPeriod(resolution);

  return {
    compare_start_at: lastPeriod,
    compare_end_at: today,
  };
};
