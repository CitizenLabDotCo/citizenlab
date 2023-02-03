// utils
import {
  getProjectFilter,
  getDateFilter,
  getDateFilterLastPeriod,
  getInterval,
} from '../../_utils/query';

// typings
import { QueryParameters } from './typings';
import {
  Query,
  QuerySchema,
  AggregationsConfig,
} from 'services/analyticsFacts';

const getAggregations = (): AggregationsConfig => ({
  all: 'count',
  visitor_id: 'count',
  duration: 'avg',
  pages_visited: 'avg',
});

export const query = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters): Query => {
  const totalsWholePeriodQuery: QuerySchema = {
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
    aggregations: getAggregations(),
  };

  const totalsLastPeriodQuery: QuerySchema = {
    fact: 'visit',
    filters: {
      'dimension_user.role': ['citizen', null],
      ...getProjectFilter('dimension_projects', projectId),
      ...getDateFilterLastPeriod('dimension_date_first_action', resolution),
    },
    aggregations: getAggregations(),
  };

  const timeSeriesQuery: QuerySchema = {
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
    groups: `dimension_date_first_action.${getInterval(resolution)}`,
    aggregations: {
      all: 'count',
      visitor_id: 'count',
      'dimension_date_first_action.date': 'first',
    },
  };

  return {
    query: [totalsWholePeriodQuery, totalsLastPeriodQuery, timeSeriesQuery],
  };
};
