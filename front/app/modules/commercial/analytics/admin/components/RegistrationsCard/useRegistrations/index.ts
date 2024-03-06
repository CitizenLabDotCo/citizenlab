import { useMemo, useState } from 'react';

import useAnalytics from 'api/analytics/useAnalytics';

import { useIntl } from 'utils/cl-intl';

import { parseTimeSeries, parseStats, parseExcelData } from './parse';
import { query } from './query';
import { getTranslations } from './translations';
import { QueryParameters, Response } from './typings';

export default function useRegistrations({
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

  const timeSeries = useMemo(
    () =>
      analytics?.data
        ? parseTimeSeries(
            analytics.data.attributes[0],
            startAtMoment,
            endAtMoment,
            currentResolution
          )
        : null,
    [analytics?.data, startAtMoment, endAtMoment, currentResolution]
  );

  const stats = analytics ? parseStats(analytics.data.attributes) : null;

  const xlsxData = useMemo(
    () =>
      analytics?.data && timeSeries && stats
        ? parseExcelData(stats, timeSeries, currentResolution, translations)
        : null,
    [analytics?.data, timeSeries, stats, currentResolution, translations]
  );

  return { currentResolution, timeSeries, stats, xlsxData };
}
