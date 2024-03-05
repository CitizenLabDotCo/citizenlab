import moment from 'moment';

import { Query, QuerySchema } from 'api/analytics/types';

import {
  getDateFilter,
  getInterval,
} from 'components/admin/GraphCards/_utils/query';

import { QueryParameters } from './typings';

export const query = ({
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters): Query => {
  const startAt = startAtMoment || moment('2017-01-01');
  const endAt = endAtMoment || moment();

  const timeSeriesQuery: QuerySchema = {
    fact: 'registration',
    filters: {
      ...getDateFilter('dimension_date_registration', startAt, endAt),
    },
    groups: `dimension_date_registration.${getInterval(resolution)}`,
    aggregations: {
      all: 'count',
      'dimension_date_registration.date': 'first',
    },
  };

  const registrationsByTimeTotal: QuerySchema = {
    fact: 'registration',
    filters: {
      ...getDateFilter('dimension_date_registration', null, endAt),
    },
    groups: 'dimension_date_registration.year',
    aggregations: {
      all: 'count',
    },
  };

  return {
    query: [timeSeriesQuery, registrationsByTimeTotal],
  };
};
