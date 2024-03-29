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
  const dateFilter = getDateFilter(
    'dimension_date_sent',
    startAtMoment,
    endAtMoment
  );

  const totalEmailsDeliveriesQuery: QuerySchema = {
    fact: 'email_delivery',
    filters: dateFilter,
    aggregations: {
      all: 'count',
    },
  };

  const customEmailsDeliveriesQuery: QuerySchema = {
    fact: 'email_delivery',
    filters: {
      ...dateFilter,
      automated: false,
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
    },
    aggregations: {
      all: 'count',
      campaign_id: 'count',
    },
  };

  const date_group = `dimension_date_sent.${getInterval(resolution)}`;
  const timeSeriesQuery: QuerySchema = {
    fact: 'email_delivery',
    filters: { ...dateFilter },
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
