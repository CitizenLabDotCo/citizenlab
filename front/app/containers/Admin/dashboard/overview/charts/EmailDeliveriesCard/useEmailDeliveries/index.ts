import { useState } from 'react';

import useAnalytics from 'api/analytics/useAnalytics';

import { useIntl } from 'utils/cl-intl';

import {
  parseStats,
  parseTimeSeries,
  mergeTimeSeries,
  parseExcelData,
} from './parse';
import { query } from './query';
import { getTranslations } from './translations';
import { QueryParameters, Response } from './typings';

export default function useEmailDeliveriesData({
  startAtMoment,
  endAtMoment,
  resolution,
  projectId,
}: QueryParameters) {
  const { formatMessage } = useIntl();
  const [currentResolution, setCurrentResolution] = useState(resolution);

  const { data: analytics } = useAnalytics<Response>(
    query({
      projectId,
      startAtMoment,
      endAtMoment,
      resolution,
    }),
    () => setCurrentResolution(resolution)
  );

  const translations = getTranslations(formatMessage);
  const stats = analytics ? parseStats(analytics.data.attributes) : null;
  const preparedTimeSeries =
    analytics &&
    mergeTimeSeries(analytics.data.attributes[3], currentResolution);
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
