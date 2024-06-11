import React from 'react';

import moment from 'moment';

import { Query } from 'api/analytics/types';
import useAnalytics from 'api/analytics/useAnalytics';
import useAuthUser from 'api/me/useAuthUser';

import { isAdmin } from 'utils/permissions/roles';

import VisitorsOverview from './VisitorsOverview';

type Response = {
  data: {
    type: 'analytics';
    attributes: [
      {
        count: number;
        first_dimension_date_created_date: string | null;
      }
    ];
  };
};

const query: Query = {
  query: {
    fact: 'session',
    aggregations: {
      all: 'count',
      'dimension_date_created.date': 'first',
    },
  },
};

const Visitors = () => {
  const { data: authUser } = useAuthUser();
  const { data: analytics } = useAnalytics<Response>(
    query,
    undefined,
    authUser ? isAdmin(authUser) : false
  );

  if (!analytics || !isAdmin(authUser)) {
    return null;
  }

  const [countData] = analytics.data.attributes;
  if (!countData) return null;

  const firstDate = countData.first_dimension_date_created_date;

  const uniqueVisitorDataDate =
    typeof firstDate === 'string' ? moment(firstDate) : undefined;

  return <VisitorsOverview uniqueVisitorDataDate={uniqueVisitorDataDate} />;
};

export default Visitors;
