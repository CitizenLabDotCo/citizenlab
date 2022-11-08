// utils
import {
  getDateFilter,
  getDateFilterLastPeriod,
  getInterval,
} from '../../utils/query';

// typings
import { Query, QuerySchema } from '../../services/analyticsFacts';
import { QueryParameters } from './typings';

export const query = ({
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters): Query => {
  const timeSeriesQuery: QuerySchema = {
    fact: 'registration',
    filters: {
      'dimension_user.role': ['citizen', null],
      ...getDateFilter(
        'dimension_date_registration',
        startAtMoment,
        endAtMoment
      ),
    },
    groups: `dimension_date_registration.${getInterval(resolution)}`,
    aggregations: {
      all: 'count',
    },
  };

  const registrationsWholePeriodQuery: QuerySchema = {
    fact: 'registration',
    filters: {
      'dimension_user.role': ['citizen', null],
      ...getDateFilter(
        'dimension_date_registration',
        startAtMoment,
        endAtMoment
      ),
    },
    aggregations: {
      all: 'count',
    },
  };

  const registrationsLastPeriodQuery: QuerySchema = {
    fact: 'registration',
    filters: {
      'dimension_user.role': ['citizen', null],
      ...getDateFilterLastPeriod('dimension_date_registration', resolution),
    },
    aggregations: {
      all: 'count',
    },
  };

  const visitsWholePeriodQuery: QuerySchema = {
    fact: 'visit',
    filters: {
      'dimension_user.role': ['citizen', null],
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
