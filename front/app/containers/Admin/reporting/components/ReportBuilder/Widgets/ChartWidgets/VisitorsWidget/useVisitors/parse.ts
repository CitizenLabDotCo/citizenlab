import { VisitorsResponse } from 'api/graph_data_units/responseTypes/VisitorsWidget';

import {
  formatPageViews,
  formatVisitDuration,
} from 'components/admin/GraphCards/VisitorsCard/useVisitors/parse';

export const parseStats = (
  attributes: VisitorsResponse['data']['attributes']
) => {
  return {
    visitors: parseVisitors(attributes),
    visits: parseVisits(attributes),
    visitDuration: parseVisitDuration(attributes),
    pageViews: parsePageViews(attributes),
  };
};

const parseVisitors = (attributes: VisitorsResponse['data']['attributes']) => {
  const sessionTotalsWholePeriod = attributes[1][0];
  const sessionTotalsComparedPeriod = attributes[3]?.[0];

  const visitorsWholePeriod =
    sessionTotalsWholePeriod?.count_monthly_user_hash ?? 0;
  const visitorsTotalComparedPeriod =
    sessionTotalsComparedPeriod?.count_monthly_user_hash;

  const delta = getDelta(visitorsWholePeriod, visitorsTotalComparedPeriod);

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

  const delta = getDelta(visitsWholePeriod, visitsTotalComparedPeriod);

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

  const visitDurationComparedPeriod = matomoVisitsComparedPeriod
    ? // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      Number(matomoVisitsComparedPeriod?.avg_duration) || 0
    : undefined;

  const delta = getDelta(visitDurationWholePeriod, visitDurationComparedPeriod);

  return {
    value: formatVisitDuration(visitDurationWholePeriod),
    delta: delta === undefined ? undefined : formatVisitDuration(delta),
  };
};

const parsePageViews = (attributes: VisitorsResponse['data']['attributes']) => {
  const matomoVisitsWholePeriod = attributes[2][0];
  const matomoVisitsComparedPeriod = attributes[4]?.[0];

  const pageViewsWholePeriod =
    Number(matomoVisitsWholePeriod?.avg_pages_visited) || 0;

  const pageViewsComparedPeriod = matomoVisitsComparedPeriod
    ? // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      Number(matomoVisitsComparedPeriod?.avg_pages_visited) || 0
    : undefined;

  const delta = getDelta(pageViewsWholePeriod, pageViewsComparedPeriod);

  return {
    value: formatPageViews(pageViewsWholePeriod),
    delta: delta === undefined ? undefined : formatPageViews(delta),
  };
};

const getDelta = (total: number, compared: number | undefined) => {
  return compared === undefined ? undefined : total - compared;
};
