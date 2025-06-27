import { useMemo, useState } from 'react';

import moment from 'moment';

import { useParticipants as useParticipantsData } from 'api/graph_data_units';
import { ParticipantsProps } from 'api/graph_data_units/requestTypes';

import { parseTimeSeries } from 'components/admin/GraphCards/ParticipantsCard/useParticipants/parse';

import { parseStats } from './parse';

export default function useParticipants({
  project_id,
  start_at,
  end_at,
  resolution = 'month',
  compare_start_at,
  compare_end_at,
}: ParticipantsProps) {
  const [currentResolution, setCurrentResolution] = useState(resolution);

  const { data: analytics } = useParticipantsData(
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

  const stats = analytics ? parseStats(analytics.data.attributes) : null;

  const timeSeries = useMemo(
    () =>
      analytics?.data
        ? parseTimeSeries(
            analytics.data.attributes.participants_timeseries,
            start_at ? moment(start_at) : null,
            end_at ? moment(end_at) : null,
            currentResolution
          )
        : null,
    [analytics?.data, start_at, end_at, currentResolution]
  );

  return { timeSeries, stats, currentResolution };
}
