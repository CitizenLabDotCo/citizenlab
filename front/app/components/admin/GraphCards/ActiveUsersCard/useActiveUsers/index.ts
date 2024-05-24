import { useMemo, useState } from 'react';

import { useActiveUsersLive } from 'api/graph_data_units';

import { useIntl } from 'utils/cl-intl';

import { getComparedPeriod } from '../../_utils/query';

import { parseTimeSeries, parseStats, parseExcelData } from './parse';
import { getTranslations } from './translations';
import { QueryParameters } from './typings';

export default function useActiveUsers({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const { formatMessage } = useIntl();
  const [currentResolution, setCurrentResolution] = useState(resolution);

  const { data: analytics } = useActiveUsersLive(
    {
      project_id: projectId,
      start_at: startAtMoment?.toISOString(),
      end_at: endAtMoment?.toISOString(),
      resolution,
      ...getComparedPeriod(resolution),
    },
    {
      onSuccess: () => setCurrentResolution(resolution),
    }
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
