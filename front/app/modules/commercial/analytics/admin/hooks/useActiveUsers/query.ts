// utils
import {
  getProjectFilter,
  getDateFilter,
  getDateFilterLastPeriod,
  getInterval,
} from '../../utils/query';

// typings
import { Query, QuerySchema } from '../../services/analyticsFacts';
import { QueryParameters } from './typings';

export const query = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters): Query => {
  const timeSeriesQuery: QuerySchema = {
    fact: 'participation',
    filters: {
      'dimension_user.role': ['citizen', null],
      ...getProjectFilter('dimension_project', projectId),
      ...getDateFilter('dimension_date_created', startAtMoment, endAtMoment),
    },
    groups: `dimension_date_created.${getInterval(resolution)}`,
    aggregations: {
      dimension_user_id: 'count',
    },
  };

  const activeUsersWholePeriodQuery: QuerySchema = {
    fact: 'participation',
    filters: {
      'dimension_user.role': ['citizen', null],
      ...getProjectFilter('dimension_project', projectId),
      ...getDateFilter('dimension_date_created', startAtMoment, endAtMoment),
    },
    aggregations: {
      dimension_user_id: 'count',
    },
  };

  const activeUsersLastPeriodQuery: QuerySchema = {
    fact: 'participation',
    filters: {
      'dimension_user.role': ['citizen', null],
      ...getProjectFilter('dimension_project', projectId),
      ...getDateFilterLastPeriod('dimension_date_created', resolution),
    },
    aggregations: {
      dimension_user_id: 'count',
    },
  };

  const visitsWholePeriodQuery: QuerySchema = {
    fact: 'visit',
    filters: {
      'dimension_user.role': ['citizen', null],
      ...getProjectFilter('dimension_projects', projectId),
      ...getDateFilter(
        'dimension_date_first_action',
        startAtMoment,
        endAtMoment
      ),
    },
    aggregations: {
      visitor_id: 'count',
    },
  };

  const visitsLastPeriodQuery: QuerySchema = {
    fact: 'visit',
    filters: {
      'dimension_user.role': ['citizen', null],
      ...getProjectFilter('dimension_projects', projectId),
      ...getDateFilterLastPeriod('dimension_date_first_action', resolution),
    },
    aggregations: {
      visitor_id: 'count',
    },
  };

  return {
    query: [
      timeSeriesQuery,
      activeUsersWholePeriodQuery,
      activeUsersLastPeriodQuery,
      visitsWholePeriodQuery,
      visitsLastPeriodQuery,
    ],
  };
};
