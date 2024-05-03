import moment from 'moment';

import { Query, QuerySchema } from 'api/analytics/types';

import {
  getDateFilter,
  getDateFilterLastPeriod,
  getInterval,
} from 'components/admin/GraphCards/_utils/query';

import { QueryParameters } from './typings';

export const query = ({
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters): Query => {
  // Always set the date moments as otherwise the queries do not filter out completed registrations
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

  const registrationsWholePeriodQuery: QuerySchema = {
    fact: 'registration',
    filters: {
      ...getDateFilter('dimension_date_registration', startAt, endAt),
    },
    aggregations: {
      all: 'count',
    },
  };

  const registrationsLastPeriodQuery: QuerySchema = {
    fact: 'registration',
    filters: {
      ...getDateFilterLastPeriod('dimension_date_registration', resolution),
    },
    aggregations: {
      all: 'count',
    },
  };

  const visitsWholePeriodQuery: QuerySchema = {
    fact: 'visit',
    filters: {
      ...getDateFilter('dimension_date_first_action', startAt, endAt),
    },
    aggregations: {
      visitor_id: 'count',
    },
  };

  const visitsLastPeriodQuery: QuerySchema = {
    fact: 'visit',
    filters: {
      ...getDateFilterLastPeriod('dimension_date_first_action', resolution),
    },
    aggregations: {
      visitor_id: 'count',
    },
  };

  return {
    query: [
      timeSeriesQuery,
      registrationsWholePeriodQuery,
      registrationsLastPeriodQuery,
      visitsWholePeriodQuery,
      visitsLastPeriodQuery,
    ],
  };
};
