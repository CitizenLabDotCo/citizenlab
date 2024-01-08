// parse
import { parseStats, parseTimeSeries } from './parse';

// typings
import { QueryParameters, Response } from './typings';
import { useMemo, useState } from 'react';
import { IResolution } from 'components/admin/ResolutionControl';

import useGraphDataUnits from 'api/graph_data_units/useGraphDataUnits';

export default function useVisitorsData({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const [currentResolution, setCurrentResolution] =
    useState<IResolution>(resolution);
  const analytics = useGraphDataUnits<Response>({
    resolvedName: 'VisitorsWidget',
    queryParameters: {
      projectId,
      startAtMoment,
      endAtMoment,
      resolution,
    },
    onSuccess: () => setCurrentResolution(resolution),
  });

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
