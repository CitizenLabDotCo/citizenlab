import { VisitorsResponse } from 'api/graph_data_units/responseTypes/VisitorsWidget';

import {
  parsePageViews,
  formatVisitDuration,
} from 'components/admin/GraphCards/VisitorsCard/useVisitors/parse';

export const parseStats = (
  attributes: VisitorsResponse['data']['attributes']
) => {
  const matomoVisitsWholePeriod = attributes[2][0];
  const matomoVisitsComparedPeriod = attributes[4]?.[0];

  return {
    visitors: parseVisitors(attributes),
    visits: parseVisits(attributes),
    visitDuration: parseVisitDuration(attributes),
    pageViews: {
      value: parsePageViews(matomoVisitsWholePeriod?.avg_pages_visited),
      lastPeriod: parsePageViews(matomoVisitsComparedPeriod?.avg_pages_visited),
    },
  };
};

const parseVisitors = (attributes: VisitorsResponse['data']['attributes']) => {
  const sessionTotalsWholePeriod = attributes[1][0];
  const sessionTotalsComparedPeriod = attributes[3]?.[0];

  const visitorsWholePeriod =
    sessionTotalsWholePeriod?.count_monthly_user_hash ?? 0;
  const visitorsTotalComparedPeriod =
    sessionTotalsComparedPeriod?.count_monthly_user_hash;

  const delta =
    visitorsTotalComparedPeriod === undefined
      ? undefined
      : visitorsWholePeriod - visitorsTotalComparedPeriod;

  return {
    value: visitorsWholePeriod,
    delta,
  };
};

const parseVisits = (attributes: VisitorsResponse['data']['attributes']) => {
  const sessionTotalsWholePeriod = attributes[1][0];
  const sessionTotalsComparedPeriod = attributes[3]?.[0];

  const visitsWholePeriod = sessionTotalsWholePeriod?.count ?? 0;
  const visitsTotalComparedPeriod = sessionTotalsComparedPeriod?.count;

  const delta =
    visitsTotalComparedPeriod === undefined
      ? undefined
      : visitsWholePeriod - visitsTotalComparedPeriod;

  return {
    value: visitsWholePeriod,
    delta,
  };
};

const parseVisitDuration = (
  attributes: VisitorsResponse['data']['attributes']
) => {
  const matomoVisitsWholePeriod = attributes[2][0];
  const matomoVisitsComparedPeriod = attributes[4]?.[0];

  const visitDurationWholePeriod =
    Number(matomoVisitsWholePeriod?.avg_duration) || 0;
  const visitDurationComparedPeriod =
    Number(matomoVisitsComparedPeriod?.avg_duration) || undefined;

  const delta =
    visitDurationComparedPeriod === undefined
      ? undefined
      : visitDurationWholePeriod - visitDurationComparedPeriod;

  return {
    value: formatVisitDuration(visitDurationWholePeriod),
    delta: delta === undefined ? undefined : formatVisitDuration(delta),
  };
};
