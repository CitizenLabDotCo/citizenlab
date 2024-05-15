import { useMemo, useState } from 'react';

import useAnalytics from 'api/analytics/useAnalytics';

import { IResolution } from 'components/admin/ResolutionControl';

import { useIntl } from 'utils/cl-intl';

import { parseStats, parseTimeSeries, parseExcelData } from './parse';
import { query } from './query';
import { getTranslations } from './translations';
import { QueryParameters, Response } from './typings';

export default function useVisitorsData({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const { formatMessage } = useIntl();
  const [currentResolution, setCurrentResolution] =
    useState<IResolution>(resolution);
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
        ? parseExcelData(stats, timeSeries, translations, currentResolution)
        : null,
    [analytics?.data, stats, timeSeries, translations, currentResolution]
  );

  return { currentResolution, stats, timeSeries, xlsxData };
}
