// services
import {
  analyticsStream,
  Query,
  QuerySchema,
} from '../../services/analyticsFacts';

// utils
import { getProjectFilter, getDateFilter } from '../../utils/query';

// typings
import { QueryParameters } from './typings';

const referrersListQuery = ({
  projectId,
  startAtMoment,
  endAtMoment,
}: QueryParameters): Query => {
  const referrersQuery: QuerySchema = {
    fact: 'visit',
    filters: {
      dimension_user: {
        role: ['citizen', null],
      },
      ...getProjectFilter('dimension_projects', projectId),
      ...getDateFilter(
        'dimension_date_last_action',
        startAtMoment,
        endAtMoment
      ),
    },
    groups: ['dimension_referrer_type.name', 'referrer_name'],
    aggregations: {
      all: 'count',
      visitor_id: 'count',
    },
  };

  return {
    query: referrersQuery,
  };
};
