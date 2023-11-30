import React from 'react';
import moment from 'moment';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useAnalytics from 'api/analytics/useAnalytics';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';

// typings
import { Query } from 'api/analytics/types';
import { Response } from '../../components/VisitorsLanguageCard/useVisitorLanguages/typings';

// components
import VisitorsOverview from './VisitorsOverview';
import { isAdmin } from 'utils/permissions/roles';

const query: Query = {
  query: {
    fact: 'visit',
    aggregations: {
      all: 'count',
      'dimension_date_first_action.date': 'first',
    },
  },
};

const Visitors = () => {
  const { data: appConfig } = useAppConfiguration();
  const { data: authUser } = useAuthUser();

  const { data: analytics } = useAnalytics<Response>(
    query,
    undefined,
    authUser ? isAdmin(authUser) : false
  );
  const visitorsDashboardEnabled = useFeatureFlag({
    name: 'visitors_dashboard',
  });

  if (!visitorsDashboardEnabled || !appConfig || !analytics) return null;

  const [countData] = analytics.data.attributes;
  if (!countData) return null;

  const firstDate = countData.first_dimension_date_first_action_date;

  const uniqueVisitorDataDate =
    typeof firstDate === 'string' ? moment(firstDate) : undefined;

  return <VisitorsOverview uniqueVisitorDataDate={uniqueVisitorDataDate} />;
};

export default Visitors;
