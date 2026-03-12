import { useMemo, useState } from 'react';

import { useInternalAdoptionLive } from 'api/graph_data_units';

import { useIntl } from 'utils/cl-intl';

import { getComparedPeriod } from '../../_utils/query';
import { Props } from '../typings';

import { parseStats, parseTimeSeries, parseExcelData } from './parse';
import { getTranslations } from './translations';

export default function useInternalAdoption({
  startAtMoment,
  endAtMoment,
  resolution = 'month',
}: Props) {
  const [currentResolution, setCurrentResolution] = useState(resolution);
  const { formatMessage } = useIntl();
  const { data: analytics } = useInternalAdoptionLive(
    {
      start_at: startAtMoment?.local().format('YYYY-MM-DD'),
      end_at: endAtMoment?.local().format('YYYY-MM-DD'),
      resolution,
      ...getComparedPeriod(resolution),
    },
    {
      onSuccess: () => setCurrentResolution(resolution),
    }
  );

  const stats = useMemo(
    () => (analytics ? parseStats(analytics.data.attributes) : null),
    [analytics]
  );

  const timeSeries = useMemo(
    () =>
      analytics?.data
        ? parseTimeSeries(
            analytics.data.attributes,
            startAtMoment ?? null,
            endAtMoment ?? null,
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
            getTranslations(formatMessage, currentResolution)
          )
        : null,
    [analytics?.data, stats, timeSeries, formatMessage, currentResolution]
  );

  return { timeSeries, stats, xlsxData, currentResolution };
}
