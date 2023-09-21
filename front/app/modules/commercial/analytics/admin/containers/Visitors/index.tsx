import React from 'react';
import moment from 'moment';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useAnalytics from 'api/analytics/useAnalytics';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// typings
import { Query, QuerySchema } from 'api/analytics/types';
import { Response } from '../../components/VisitorsLanguageCard/useVisitorLanguages/typings';

// components
import VisitorsOverview from './VisitorsOverview';

const query = (): Query => {
  const localesCountQuery: QuerySchema = {
    fact: 'visit',
    aggregations: {
      all: 'count',
      'dimension_date_first_action.date': 'first',
    },
  };

  return {
    query: localesCountQuery,
  };
};

const Visitors = () => {
  const { data: appConfig } = useAppConfiguration();
  const { data: analytics } = useAnalytics<Response>(query());
  const visitorsDashboardEnabled = useFeatureFlag({
    name: 'visitors_dashboard',
  });

  if (!visitorsDashboardEnabled || !appConfig || !analytics) return null;

  const [countData] = analytics.data.attributes;
  if (!countData) return null;

  const uniqueVisitorDataDate = moment(
    countData.first_dimension_date_first_action_date
  );

  return <VisitorsOverview uniqueVisitorDataDate={uniqueVisitorDataDate} />;
};

export default Visitors;
