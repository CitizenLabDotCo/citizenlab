// services

// i18n
import { useIntl } from 'utils/cl-intl';
import { getTranslations } from './translations';

// query
import { query } from './query';

// parse
import { parseTimeSeries, parseStats, parseExcelData } from './parse';

// utils

// typings
import { QueryParameters, Response } from './typings';
import useAnalytics from 'api/analytics/useAnalytics';

export default function useActiveUsers({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const { formatMessage } = useIntl();

  const { data: analytics } = useAnalytics<Response>(
    query({
      projectId,
      startAtMoment,
      endAtMoment,
      resolution,
    })
  );

  const stats = analytics ? parseStats(analytics.data.attributes) : null;

  const timeSeries = analytics?.data
    ? parseTimeSeries(
        analytics.data.attributes[0],
        startAtMoment,
        endAtMoment,
        resolution
      )
    : null;

  const xlsxData =
    analytics?.data && stats
      ? parseExcelData(
          stats,
          timeSeries,
          resolution,
          getTranslations(formatMessage)
        )
      : null;

  const currentResolution = resolution;

  return { timeSeries, stats, xlsxData, currentResolution };
}
