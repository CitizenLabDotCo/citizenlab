// parse
import { parseStats, parseTimeSeries } from './parse';

// typings
import { QueryParameters } from './typings';
import { useMemo, useState } from 'react';
import { IResolution } from 'components/admin/ResolutionControl';

import { useVisitors as useVisitorsData } from 'api/graph_data_units';

export default function useVisitors({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const [currentResolution, setCurrentResolution] =
    useState<IResolution>(resolution);

  const analytics = useVisitorsData(
    {
      projectId,
      startAtMoment,
      endAtMoment,
      resolution,
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
            analytics.data.attributes[1],
            startAtMoment,
            endAtMoment,
            currentResolution
          )
        : null,
    [analytics?.data, startAtMoment, endAtMoment, currentResolution]
  );

  return { currentResolution, stats, timeSeries };
}
