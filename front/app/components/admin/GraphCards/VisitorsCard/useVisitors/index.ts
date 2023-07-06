// services

// i18n
import { useIntl } from 'utils/cl-intl';
import { getTranslations } from './translations';

// query
import { query } from './query';

// parse
import { parseStats, parseTimeSeries, parseExcelData } from './parse';

// typings
import { QueryParameters, Response } from './typings';
import useAnalytics from 'api/analytics/useAnalytics';
import { useMemo } from 'react';

export default function useVisitorsData({
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

  const translations = getTranslations(formatMessage);
  const currentResolution = resolution;
  const stats = analytics ? parseStats(analytics.data.attributes) : null;

  const timeSeries = useMemo(
    () =>
      analytics?.data
        ? parseTimeSeries(
            analytics.data.attributes[2],
            startAtMoment,
            endAtMoment,
            resolution
          )
        : null,
    [analytics?.data, startAtMoment, endAtMoment, resolution]
  );

  const xlsxData = useMemo(
    () =>
      analytics?.data && stats
        ? parseExcelData(stats, timeSeries, translations, resolution)
        : null,
    [analytics?.data, stats, timeSeries, translations, resolution]
  );

  return { currentResolution, stats, timeSeries, xlsxData };
}
