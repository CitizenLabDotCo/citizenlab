// query
import { query } from './query';

// parse
import { parseTimeSeries, parseStats } from './parse';

// typings
import { QueryParameters, Response } from './typings';
import useAnalytics from 'api/analytics/useAnalytics';
import { useMemo, useState } from 'react';

export default function useActiveUsers({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
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

  return { timeSeries, stats, currentResolution };
}
