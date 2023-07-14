// utils
import {
  getDateFilter,
  getInterval,
  getProjectFilter,
} from 'components/admin/GraphCards/_utils/query';

// typings
import { Query, QuerySchema } from 'api/analytics/types';
import { QueryParameters } from './typings';
import moment from 'moment';

export const query = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters): Query => {
  const startAt = startAtMoment || moment('2017-01-01');
  const endAt = endAtMoment || moment();

  const timeSeriesQuery: QuerySchema = {
    fact: 'participation',
    filters: {
      ...getDateFilter('dimension_date_created', startAt, endAt),
      ...getProjectFilter('dimension_project', projectId),
      'dimension_type.name': 'reaction',
      'dimension_type.parent': 'idea',
    },
    groups: `dimension_date_created.${getInterval(resolution)}`,
    aggregations: {
      'dimension_date_created.date': 'first',
      likes_count: 'sum',
      dislikes_count: 'sum',
    },
  };

  const postsByTimeTotal: QuerySchema = {
    fact: 'participation',
    filters: {
      ...getDateFilter('dimension_date_created', null, endAt),
      ...getProjectFilter('dimension_project', projectId),
      'dimension_type.name': 'reaction',
      'dimension_type.parent': 'idea',
    },
    aggregations: {
      reactions_count: 'sum',
    },
  };

  return {
    query: [timeSeriesQuery, postsByTimeTotal],
  };
};
