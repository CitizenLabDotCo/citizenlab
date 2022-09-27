import { Response, Stats } from './typings';

export const parseStats = ([
  totalsWholePeriodRows,
  totalsLastPeriodRows,
]: Response['data']): Stats => {
  const wholePeriod = totalsWholePeriodRows[0];
  const lastPeriod = totalsLastPeriodRows[0];

  return {
    visitors: {
      value: wholePeriod.count_visitor_id.toLocaleString(),
      lastPeriod: lastPeriod.count_visitor_id.toLocaleString(),
    },
    visits: {
      value: wholePeriod.count.toLocaleString(),
      lastPeriod: lastPeriod.count.toLocaleString(),
    },
    visitDuration: {
      value: wholePeriod.avg_duration ?? '-',
      lastPeriod: lastPeriod.avg_duration ?? '-',
    },
    pageViews: {
      value: wholePeriod.avg_pages_visited ?? '-',
      lastPeriod: lastPeriod.avg_pages_visited ?? '-',
    },
  };
};
