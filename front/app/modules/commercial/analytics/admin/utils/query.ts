import moment from 'moment';
import { IResolution } from 'components/admin/ResolutionControl';

type ProjectFilter = { project: { id: string } };
type EmptyObject = Record<string, unknown>;

export const getProjectFilter = (
  filter: string,
  projectId: string | undefined
): ProjectFilter | EmptyObject => {
  return projectId ? { [filter]: { id: projectId } } : {};
};

const formatDate = (dateString: string) =>
  moment(dateString).format('yyyy-MM-DD');

type DateFilter = {
  [key: string]: {
    date: {
      from: string;
      to: string;
    };
  };
};

export const getDateFilter = (
  filter: string,
  startAt: string | null | undefined,
  endAt: string | null | undefined
): DateFilter | EmptyObject => {
  return startAt && endAt
    ? {
        [filter]: {
          date: {
            from: formatDate(startAt),
            to: formatDate(endAt),
          },
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
