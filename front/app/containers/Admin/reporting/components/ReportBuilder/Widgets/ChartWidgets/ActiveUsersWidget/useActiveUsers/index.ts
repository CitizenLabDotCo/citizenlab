// parse
import { parseTimeSeries, parseStats } from './parse';

// typings
import { QueryParameters } from './typings';
import { useMemo, useState } from 'react';

import { useActiveUsers as useActiveUsersData } from 'api/graph_data_units';

export default function useActiveUsers({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const [currentResolution, setCurrentResolution] = useState(resolution);

  const analytics = useActiveUsersData(
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
