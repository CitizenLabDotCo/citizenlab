import { useMemo, useState } from 'react';

import { useVisitorsLive } from 'api/graph_data_units';

import { getComparedPeriod } from 'components/admin/GraphCards/_utils/query';
import { IResolution } from 'components/admin/ResolutionControl';

import { useIntl } from 'utils/cl-intl';

import { parseStats, parseTimeSeries, parseExcelData } from './parse';
import { getTranslations } from './translations';
import { QueryParameters } from './typings';

export default function useVisitorsData({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution = 'month',
}: QueryParameters) {
  const { formatMessage } = useIntl();
  const [currentResolution, setCurrentResolution] =
    useState<IResolution>(resolution);

  const { data: analytics } = useVisitorsLive(
    {
      start_at: startAtMoment?.toISOString(),
      end_at: endAtMoment?.toISOString(),
      project_id: projectId,
      resolution,
      ...getComparedPeriod(resolution),
    },
    {
      onSuccess: () => setCurrentResolution(resolution),
    }
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
