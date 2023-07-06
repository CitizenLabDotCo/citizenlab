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
import { useMemo } from 'react';

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

  const timeSeries = useMemo(
    () =>
      analytics?.data
        ? parseTimeSeries(
            analytics.data.attributes[0],
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
        ? parseExcelData(
            stats,
            timeSeries,
            resolution,
            getTranslations(formatMessage)
          )
        : null,
    [analytics?.data, stats, timeSeries, resolution, formatMessage]
  );

  const currentResolution = resolution;

  return { timeSeries, stats, xlsxData, currentResolution };
}
