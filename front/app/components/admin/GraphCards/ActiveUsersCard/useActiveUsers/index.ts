import { useMemo, useState } from 'react';

import useAnalytics from 'api/analytics/useAnalytics';

import { useIntl } from 'utils/cl-intl';

import { parseTimeSeries, parseStats, parseExcelData } from './parse';
import { query } from './query';
import { getTranslations } from './translations';
import { QueryParameters, Response } from './typings';

export default function useActiveUsers({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
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

  const stats = analytics ? parseStats(analytics.data.attributes) : null;

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

  const xlsxData = useMemo(
    () =>
      analytics?.data && stats
        ? parseExcelData(
            stats,
            timeSeries,
            currentResolution,
            getTranslations(formatMessage)
          )
        : null,
    [analytics?.data, stats, timeSeries, currentResolution, formatMessage]
  );

  return { timeSeries, stats, xlsxData, currentResolution };
}
