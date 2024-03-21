import { useMemo, useState } from 'react';

import moment from 'moment';

import { useActiveUsers as useActiveUsersData } from 'api/graph_data_units';

import { parseTimeSeries, parseStats } from './parse';
import { QueryParameters } from './typings';

export default function useActiveUsers({
  projectId,
  startAt,
  endAt,
  resolution,
}: QueryParameters) {
  const [currentResolution, setCurrentResolution] = useState(resolution);

  const { data: analytics } = useActiveUsersData(
    {
      project_id: projectId,
      start_at: startAt,
      end_at: endAt,
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
            startAt ? moment(startAt) : null,
            endAt ? moment(endAt) : null,
            currentResolution
          )
        : null,
    [analytics?.data, startAt, endAt, currentResolution]
  );

  return { timeSeries, stats, currentResolution };
}
