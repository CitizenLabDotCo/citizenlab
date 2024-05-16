import { VisitorsResponse } from 'api/graph_data_units/responseTypes/VisitorsWidget';

export const parseStats = ([
  _,
  totalsWholePeriodRows,
]: VisitorsResponse['data']['attributes']) => {
  const wholePeriod = totalsWholePeriodRows[0];

  return {
    visitors: {
      value: wholePeriod?.count_visitor_id.toLocaleString() ?? '0',
    },
    visits: {
      value: wholePeriod?.count.toLocaleString() ?? '0',
    },
  };
};
