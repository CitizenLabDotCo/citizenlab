import { useState, useMemo } from 'react';

import moment from 'moment';

import { useParticipation as useParticipationData } from 'api/graph_data_units';
import { ParticipationProps } from 'api/graph_data_units/requestTypes';

import { parseStats } from './parse/parseStats';
import { parseCombinedTimeSeries } from './parse/parseTimeSeries';

export default function useParticipation({
  project_id,
  start_at,
  end_at,
  resolution = 'month',
  compare_start_at,
  compare_end_at,
}: ParticipationProps) {
  const [currentResolution, setCurrentResolution] = useState(resolution);

  const { data: analytics } = useParticipationData(
    {
      project_id,
      start_at,
      end_at,
      resolution,
      compare_start_at,
      compare_end_at,
    },
    {
      onSuccess: () => setCurrentResolution(resolution),
    }
  );

  const timeSeries = useMemo(
    () =>
      analytics?.data
        ? parseCombinedTimeSeries(
            analytics.data.attributes,
            start_at ? moment(start_at) : null,
            end_at ? moment(end_at) : null,
            currentResolution
          )
        : null,
    [analytics?.data, start_at, end_at, currentResolution]
  );

  const stats = useMemo(() => {
    if (!analytics?.data) {
      return null;
    }

    return parseStats(analytics.data.attributes);
  }, [analytics?.data]);

  return { timeSeries, stats, currentResolution };
}
