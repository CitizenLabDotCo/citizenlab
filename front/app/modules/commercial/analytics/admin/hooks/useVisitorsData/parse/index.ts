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

interface Translations {
  stats: string;
  timeSeries: string;
  statistic: string;
  total: string;
  lastPeriod: string;
  visitors: string;
  visits: string;
  visitDuration: string;
  pageViews: string;
}

// export const getTranslations = (
//   formatMessage: InjectedIntlProps['intl']['formatMessage']
// ): Translations => ({
//   statusChanged: formatMessage(messages.statusChanged),
//   officialUpdate: formatMessage(messages.officialUpdate),
//   feedbackGiven: formatMessage(messages.feedbackGiven),
//   total: formatMessage(messages.total),
//   averageTimeColumnName: formatMessage(messages.averageTimeColumnName),
//   inputStatus: formatMessage(messages.inputStatus),
//   responseTime: formatMessage(messages.responseTime),
//   inputsByStatus: formatMessage(messages.inputsByStatus),
//   status: formatMessage(messages.status),
//   numberOfInputs: formatMessage(messages.numberOfInputs),
//   percentageOfInputs: formatMessage(messages.percentageOfInputs),
// });

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

export const parseExcelData = (
  stats: Stats,
  timeSeries: TimeSeries | null,
  translations: Translations
) => {
  const statsData = keys(stats).map((key) => {
    const stat = stats[key];

    return {
      [translations.statistic]: translations[key],
      [translations.total]: stat.value,
      [translations.lastPeriod]: stat.lastPeriod
    }
  })

  const timeSeriesData = timeSeries?.map((row) => ({
    
  }))

  const xlsxData = {
    [translations.stats]: statsData,
    [translations.timeSeries]: timeSeriesData ?? []
  }

  return xlsxData
}