// utils
import { getProjectFilter, getDateFilter } from '../../_utils/query';

// typings
// import { QueryParameters, QueryParametersWithoutPagination } from './typings';
import { ProjectId, Dates, Pagination } from '../../typings';
import { Query, QuerySchema } from 'api/analytics/types';

export const referrersListQuery = ({
  projectId,
  startAtMoment,
  endAtMoment,
  pageNumber,
  pageSize,
}: ProjectId & Dates & Pagination): Query => {
  const referrersListQuery: QuerySchema = {
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
    groups: ['dimension_referrer_type.name', 'referrer_name'],
    aggregations: {
      all: 'count',
      visitor_id: 'count',
    },
    page: {
      number: pageNumber,
      size: pageSize,
    },
  };

  return {
    query: referrersListQuery,
  };
};

export const referrersTotalQuery = ({
  projectId,
  startAtMoment,
  endAtMoment,
}: ProjectId & Dates): Query => {
  const referrersTotalQuery: QuerySchema = {
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
    aggregations: {
      all: 'count',
      visitor_id: 'count',
    },
  };

  return {
    query: referrersTotalQuery,
  };
};
