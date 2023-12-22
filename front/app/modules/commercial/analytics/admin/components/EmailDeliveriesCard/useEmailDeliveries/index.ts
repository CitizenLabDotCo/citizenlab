// services

// i18n
import { useIntl } from 'utils/cl-intl';
import { getTranslations } from './translations';

// query
import { query } from './query';

// parse
import {
  parseStats,
  parseTimeSeries,
  mergeTimeSeries,
  parseExcelData,
} from './parse';

// typings
import { QueryParameters, Response } from './typings';
import useAnalytics from 'api/analytics/useAnalytics';
import { useState } from 'react';

export default function useEmailDeliveriesData({
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const { formatMessage } = useIntl();
  const [currentResolution, setCurrentResolution] = useState(resolution);

  const { data: analytics } = useAnalytics<Response>(
    query({
      startAtMoment,
      endAtMoment,
      resolution,
    }),
    () => setCurrentResolution(resolution)
  );

  const translations = getTranslations(formatMessage);
  const stats = analytics ? parseStats(analytics.data.attributes) : null;
  const preparedTimeSeries =
    analytics && mergeTimeSeries(analytics.data.attributes[3], currentResolution);
  const timeSeries =
    analytics?.data && preparedTimeSeries
      ? parseTimeSeries(
          preparedTimeSeries,
          startAtMoment,
          endAtMoment,
          currentResolution
        )
      : null;
  const xlsxData =
    analytics?.data && stats
      ? parseExcelData(stats, timeSeries, translations)
      : null;

  return { currentResolution, stats, timeSeries, xlsxData };
}
