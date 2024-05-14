import { useMemo, useState } from 'react';

import { useRegistrationsLive } from 'api/graph_data_units';

import { useIntl } from 'utils/cl-intl';

import { parseTimeSeries, parseStats, parseExcelData } from './parse';
import { getTranslations } from './translations';
import { QueryParameters } from './typings';

export default function useRegistrations({
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const { formatMessage } = useIntl();
  const [currentResolution, setCurrentResolution] = useState(resolution);

  const { data: analytics } = useRegistrationsLive(
    {
      start_at: startAtMoment?.toISOString(),
      end_at: endAtMoment?.toISOString(),
    },
    {
      onSuccess: () => setCurrentResolution(resolution),
    }
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
