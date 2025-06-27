import { Query, QuerySchema } from 'api/analytics/types';

import {
  getDateFilter,
  getInterval,
  getProjectFilter,
} from 'components/admin/GraphCards/_utils/query';

import { QueryParameters } from './typings';

export const query = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters): Query => {
  const dateFilter = getDateFilter(
    'dimension_date_sent',
    startAtMoment,
    endAtMoment
  );

  const totalEmailsDeliveriesQuery: QuerySchema = {
    fact: 'email_delivery',
    filters: {
      ...dateFilter,
      ...getProjectFilter('dimension_project', projectId),
    },
    aggregations: {
      all: 'count',
    },
  };

  const customEmailsDeliveriesQuery: QuerySchema = {
    fact: 'email_delivery',
    filters: {
      ...dateFilter,
      automated: false,
      ...getProjectFilter('dimension_project', projectId),
    },
    aggregations: {
      all: 'count',
      campaign_id: 'count',
    },
  };

  const automatedEmailsDeliveriesQuery: QuerySchema = {
    fact: 'email_delivery',
    filters: {
      ...dateFilter,
      automated: true,
      ...getProjectFilter('dimension_project', projectId),
    },
    aggregations: {
      all: 'count',
      campaign_id: 'count',
    },
  };

  const date_group = `dimension_date_sent.${getInterval(resolution)}`;
  const timeSeriesQuery: QuerySchema = {
    fact: 'email_delivery',
    filters: {
      ...dateFilter,
      ...getProjectFilter('dimension_project', projectId),
    },
    groups: [date_group, 'automated'],
    aggregations: {
      all: 'count',
      [date_group]: 'first',
    },
  };

  return {
    query: [
      totalEmailsDeliveriesQuery,
      customEmailsDeliveriesQuery,
      automatedEmailsDeliveriesQuery,
      timeSeriesQuery,
    ],
  };
};
