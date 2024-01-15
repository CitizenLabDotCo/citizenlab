// parse
import { parseTimeSeries, parseStats } from './parse';

// typings
import { QueryParameters, Response } from './typings';
import { useMemo, useState } from 'react';

import useGraphDataUnits from 'api/graph_data_units/useGraphDataUnits';

export default function useActiveUsers({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const [currentResolution, setCurrentResolution] = useState(resolution);

  const analytics = useGraphDataUnits<Response>(
    {
      resolvedName: 'ActiveUsersWidget',
      props: {
        projectId,
        startAtMoment,
        endAtMoment,
        resolution,
      },
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
