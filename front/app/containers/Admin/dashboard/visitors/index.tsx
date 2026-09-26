import React from 'react';

import { parseISO } from 'date-fns';

import { Query } from 'api/analytics/types';
import useAnalytics from 'api/analytics/useAnalytics';

import { START_DATE_PAGEVIEW_AND_EXPANDED_SESSION_DATA_COLLECTION as LOWER_BOUND } from '../constants';

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

const getDefaultStartDate = (firstSessionDate: string | null) => {
  if (!firstSessionDate) return parseISO(LOWER_BOUND);

  const defaultStartDate =
    new Date(firstSessionDate) > new Date(LOWER_BOUND)
      ? firstSessionDate
      : LOWER_BOUND;

  return parseISO(defaultStartDate);
};

const Visitors = () => {
  const { data: analytics } = useAnalytics<Response>(query, undefined, true);

  if (!analytics) {
    return null;
  }

  const [countData] = analytics.data.attributes;
  const firstSessionDate = countData.min_dimension_date_created_date;

  return (
    <VisitorsOverview
      defaultStartDate={getDefaultStartDate(firstSessionDate)}
    />
  );
};

export default Visitors;
