// utils
import {
  getDateFilter,
  getInterval,
  getProjectFilter,
} from 'components/admin/GraphCards/_utils/query';

// typings
import { Query, QuerySchema } from 'services/analyticsFacts';
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
    fact: 'post',
    filters: {
      ...getDateFilter('dimension_date_created', startAt, endAt),
      ...getProjectFilter('dimension_project', projectId),
      'dimension_type.name': 'idea',
      publication_status: 'published',
    },
    groups: `dimension_date_created.${getInterval(resolution)}`,
    aggregations: {
      all: 'count',
      'dimension_date_created.date': 'first',
    },
  };

  const postsByTimeTotal: QuerySchema = {
    fact: 'post',
    filters: {
      ...getDateFilter('dimension_date_created', null, endAt),
      ...getProjectFilter('dimension_project', projectId),
      'dimension_type.name': 'idea',
      publication_status: 'published',
    },
    aggregations: {
      all: 'count',
    },
  };

  return {
    query: [timeSeriesQuery, postsByTimeTotal],
  };
};
