import React from 'react';

import moment from 'moment';

import { Query } from 'api/analytics/types';
import useAnalytics from 'api/analytics/useAnalytics';

import VisitorsOverview from './VisitorsOverview';

type Response = {
  data: {
    type: 'analytics';
    attributes: [
      {
        count: number;
        min_dimension_date_created_date: string | null;
      }
    ];
  };
};

const query: Query = {
  query: {
    fact: 'session',
    aggregations: {
      all: 'count',
      'dimension_date_created.date': 'min',
    },
  },
};

const Visitors = () => {
  const { data: analytics } = useAnalytics<Response>(query, undefined, true);

  if (!analytics) {
    return null;
  }

  const [countData] = analytics.data.attributes;
  const firstDate = countData.min_dimension_date_created_date;
  const uniqueVisitorDataDate =
    typeof firstDate === 'string' ? moment(firstDate) : undefined;

  return <VisitorsOverview uniqueVisitorDataDate={uniqueVisitorDataDate} />;
};

export default Visitors;
