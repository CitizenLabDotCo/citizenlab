// i18n
import { useIntl } from 'utils/cl-intl';
import { getTranslations } from './translations';

// query
import { query } from './query';

// parse
import { parseTimeSeries, parseStats, parseExcelData } from './parse';

// typings
import { QueryParameters, Response } from './typings';
import useAnalytics from 'api/analytics/useAnalytics';

export default function useRegistrations({
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const { formatMessage } = useIntl();

  const { data: analytics } = useAnalytics<Response>(
    query({
      startAtMoment,
      endAtMoment,
      resolution,
    })
  );

  const translations = getTranslations(formatMessage);

  const timeSeries = analytics?.data
    ? parseTimeSeries(
        analytics.data.attributes[0],
        startAtMoment,
        endAtMoment,
        resolution
      )
    : null;

  const stats = analytics ? parseStats(analytics.data.attributes) : null;

  const xlsxData =
    analytics?.data && timeSeries && stats
      ? parseExcelData(stats, timeSeries, resolution, translations)
      : null;

  const currentResolution = resolution;

  return { currentResolution, timeSeries, stats, xlsxData };
}
