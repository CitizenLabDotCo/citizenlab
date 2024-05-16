import { VisitorsResponse } from 'api/graph_data_units/responseTypes/VisitorsWidget';

export const parseStats = ([
  _,
  totalsWholePeriodRows,
]: VisitorsResponse['data']['attributes']) => {
  const sessionTotalsWholePeriod = totalsWholePeriodRows[0];

  return {
    visitors: {
      value:
        sessionTotalsWholePeriod?.count_monthly_user_hash.toLocaleString() ??
        '0',
    },
    visits: {
      value: sessionTotalsWholePeriod?.count.toLocaleString() ?? '0',
    },
  };
};
