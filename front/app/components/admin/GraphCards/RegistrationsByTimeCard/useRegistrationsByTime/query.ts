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
