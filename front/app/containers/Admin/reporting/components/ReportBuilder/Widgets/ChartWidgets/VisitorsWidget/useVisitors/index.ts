import { useMemo, useState } from 'react';

import moment from 'moment';

import { useVisitors as useVisitorsData } from 'api/graph_data_units';

import { IResolution } from 'components/admin/ResolutionControl';

import { parseStats, parseTimeSeries } from './parse';
import { QueryParameters } from './typings';

export default function useVisitors({
  projectId,
  startAt,
  endAt,
  resolution,
}: QueryParameters) {
  const [currentResolution, setCurrentResolution] =
    useState<IResolution>(resolution);

  const { data: analytics } = useVisitorsData(
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

  return { currentResolution, stats, timeSeries };
}
