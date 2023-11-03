// utils
import {
  getProjectFilter,
  getDateFilter,
  getInterval,
} from 'components/admin/GraphCards/_utils/query';

// typings
import { Query, QuerySchema } from 'api/analytics/types';
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
      'dimension_date_created.date': 'first',
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

  return {
    query: [timeSeriesQuery, activeUsersWholePeriodQuery],
  };
};
