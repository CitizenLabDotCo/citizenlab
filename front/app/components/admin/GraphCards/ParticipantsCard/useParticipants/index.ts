import { useMemo, useState } from 'react';

import { useParticipantsLive } from 'api/graph_data_units';

import { useIntl } from 'utils/cl-intl';

import { getComparedPeriod } from '../../_utils/query';

import { parseTimeSeries, parseStats, parseExcelData } from './parse';
import { getTranslations } from './translations';
import { QueryParameters } from './typings';

export default function useParticipants({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const { formatMessage } = useIntl();
  const [currentResolution, setCurrentResolution] = useState(resolution);

  const { data: analytics } = useParticipantsLive(
    {
      project_id: projectId,
      // We use local time to avoid timezone issues and use the timezone of the user making changes
      start_at: startAtMoment?.local().format('YYYY-MM-DD'),
      end_at: endAtMoment?.local().format('YYYY-MM-DD'),
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
            analytics.data.attributes.participants_timeseries,
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
