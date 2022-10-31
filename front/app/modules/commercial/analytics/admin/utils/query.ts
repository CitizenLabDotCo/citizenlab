import moment, { Moment } from 'moment';
import { IResolution } from 'components/admin/ResolutionControl';

type ProjectFilter = { [key: string]: string };
type EmptyObject = Record<string, unknown>;

export const getProjectFilter = (
  filter: string,
  projectId: string | undefined
): ProjectFilter | EmptyObject => {
  return projectId ? { [filter]: projectId } : {};
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
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

  return startAt && endAt
    ? {
        [`${filter}.date`]: {
          from: formatDate(startAt),
          to: formatDate(endAt),
        },
      }
    : {};
};

type Interval = 'month' | 'week' | 'date';

const RESOLUTION_TO_INTERVAL: Record<IResolution, Interval> = {
  month: 'month',
  week: 'week',
  day: 'date',
};

export const getInterval = (resolution: IResolution) =>
  RESOLUTION_TO_INTERVAL[resolution];
