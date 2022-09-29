// parse dates
import { parseMonths } from './parseMonths';
import { parseWeeks } from './parseWeeks';
import { parseDays } from './parseDays';

// utils
import { keys } from 'utils/helperUtils';

// typings
import { Moment } from 'moment';
import { IResolution } from 'components/admin/ResolutionControl';
import { Response, Stats, TimeSeries, TimeSeriesResponse } from '../typings';
import { Translations } from '../utils';

export const parseStats = ([
  totalsWholePeriodRows,
  totalsLastPeriodRows,
]: Response['data']): Stats => {
  const wholePeriod = totalsWholePeriodRows[0];
  const lastPeriod = totalsLastPeriodRows[0];

  return {
    visitors: {
      value: wholePeriod?.count_visitor_id.toLocaleString() ?? '0',
      lastPeriod: lastPeriod?.count_visitor_id.toLocaleString() ?? '0',
    },
    visits: {
      value: wholePeriod?.count.toLocaleString() ?? '0',
      lastPeriod: lastPeriod?.count.toLocaleString() ?? '0',
    },
    visitDuration: {
      value: wholePeriod?.avg_duration ?? '-',
      lastPeriod: lastPeriod?.avg_duration ?? '-',
    },
    pageViews: {
      value: wholePeriod?.avg_pages_visited ?? '-',
      lastPeriod: lastPeriod?.avg_pages_visited ?? '-',
    },
  };
};

export const parseTimeSeries = (
  responseTimeSeries: TimeSeriesResponse,
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null | undefined,
  resolution: IResolution
): TimeSeries | null => {
  if (responseTimeSeries.length === 0) return null;

  if (resolution === 'month') {
    return parseMonths(responseTimeSeries, startAtMoment, endAtMoment);
  }

  if (resolution === 'week') {
    return parseWeeks(responseTimeSeries, startAtMoment, endAtMoment);
  }

  return parseDays(responseTimeSeries, startAtMoment, endAtMoment);
};

const RESOLUTION_TO_MESSAGE_KEY: Record<IResolution, keyof Translations> = {
  month: 'last30Days',
  week: 'last7Days',
  day: 'yesterday',
};

export const parseExcelData = (
  stats: Stats,
  timeSeries: TimeSeries | null,
  translations: Translations,
  resolution: IResolution
) => {
  const statsData = keys(stats).map((key) => {
    const stat = stats[key];
    const lastPeriod = translations[RESOLUTION_TO_MESSAGE_KEY[resolution]];

    return {
      [translations.statistic]: translations[key],
      [translations.total]: stat.value,
      [lastPeriod]: stat.lastPeriod,
    };
  });

  const timeSeriesData = timeSeries?.map((row) => ({
    [translations.visits]: row.visits,
    [translations.visitors]: row.visitors,
    [translations.date]: row.date,
  }));

  const xlsxData = {
    [translations.stats]: statsData,
    [translations.timeSeries]: timeSeriesData ?? [],
  };

  return xlsxData;
};
