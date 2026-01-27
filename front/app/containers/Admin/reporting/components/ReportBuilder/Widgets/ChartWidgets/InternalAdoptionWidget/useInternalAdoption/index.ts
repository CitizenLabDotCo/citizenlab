import { useMemo, useState } from 'react';

import moment from 'moment';

import { useInternalAdoption as useInternalAdoptionData } from 'api/graph_data_units';
import { InternalAdoptionProps } from 'api/graph_data_units/requestTypes';

import { parseTimeSeries } from 'components/admin/GraphCards/InternalAdoptionCard/useInternalAdoption/parse';

import { parseStats } from './parseStats';

export default function useInternalAdoption({
  start_at,
  end_at,
  resolution = 'month',
  compare_start_at,
  compare_end_at,
}: InternalAdoptionProps) {
  const [currentResolution, setCurrentResolution] = useState(resolution);

  const { data: analytics } = useInternalAdoptionData(
    {
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

  const stats = useMemo(
    () => (analytics ? parseStats(analytics.data.attributes) : null),
    [analytics]
  );

  const timeSeries = useMemo(
    () =>
      analytics?.data
        ? parseTimeSeries(
            analytics.data.attributes,
            start_at ? moment(start_at) : null,
            end_at ? moment(end_at) : null,
            currentResolution
          )
        : null,
    [analytics?.data, start_at, end_at, currentResolution]
  );

  return { timeSeries, stats, currentResolution };
}
