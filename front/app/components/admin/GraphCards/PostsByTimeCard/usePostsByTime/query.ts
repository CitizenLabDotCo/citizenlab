// utils
import {
  getDateFilter,
  getInterval,
} from 'components/admin/GraphCards/_utils/query';

// typings
import { Query, QuerySchema } from 'services/analyticsFacts';
import { QueryParameters } from './typings';
import moment from 'moment';

export const query = ({
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters): Query => {
  const startAt = startAtMoment || moment('2017-01-01');
  const endAt = endAtMoment || moment();

  const timeSeriesQuery: QuerySchema = {
    fact: 'post',
    filters: {
      ...getDateFilter('dimension_date_created', startAt, endAt),
      'dimension_type.name': 'idea',
    },
    groups: `dimension_date_created.${getInterval(resolution)}`,
    aggregations: {
      all: 'count',
      'dimension_date_created.date': 'first',
    },
  };

  const postsByTimeWholePeriodQuery: QuerySchema = {
    fact: 'post',
    filters: {
      ...getDateFilter('dimension_date_created', startAt, endAt),
      'dimension_type.name': 'idea',
    },
    aggregations: {
      all: 'count',
    },
  };

  const postsByTimeTotal: QuerySchema = {
    fact: 'post',
    filters: {
      'dimension_type.name': 'idea',
    },
    aggregations: {
      all: 'count',
    },
  };

  return {
    query: [timeSeriesQuery, postsByTimeWholePeriodQuery, postsByTimeTotal],
  };
};
