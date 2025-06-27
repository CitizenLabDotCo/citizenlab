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
  const { visitors_whole_period, visitors_compared_period } = attributes;

  const delta = getDelta(visitors_whole_period, visitors_compared_period);

  return {
    value: visitors_whole_period,
    delta,
  };
};

const parseVisits = (attributes: VisitorsResponse['data']['attributes']) => {
  const { visits_whole_period, visits_compared_period } = attributes;

  const delta = getDelta(visits_whole_period, visits_compared_period);

  return {
    value: visits_whole_period,
    delta,
  };
};

const parseVisitDuration = (
  attributes: VisitorsResponse['data']['attributes']
) => {
  const {
    avg_seconds_per_session_whole_period,
    avg_seconds_per_session_compared_period,
  } = attributes;

  const delta = getDelta(
    avg_seconds_per_session_whole_period,
    avg_seconds_per_session_compared_period
  );

  return {
    value: formatVisitDuration(avg_seconds_per_session_whole_period),
    delta: delta === undefined ? undefined : formatVisitDuration(delta),
  };
};

const parsePageViews = (attributes: VisitorsResponse['data']['attributes']) => {
  const { avg_pages_visited_whole_period, avg_pages_visited_compared_period } =
    attributes;

  const delta = getDelta(
    avg_pages_visited_whole_period,
    avg_pages_visited_compared_period
  );

  return {
    value: formatPageViews(avg_pages_visited_whole_period),
    delta: delta === undefined ? undefined : formatPageViews(delta),
  };
};

const getDelta = (total: number, compared: number | undefined) => {
  return compared === undefined ? undefined : total - compared;
};
