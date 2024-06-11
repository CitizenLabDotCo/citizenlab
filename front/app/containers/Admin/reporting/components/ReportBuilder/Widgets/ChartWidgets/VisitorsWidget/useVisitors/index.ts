import { useMemo, useState } from 'react';

import moment from 'moment';

import { useVisitors as useVisitorsData } from 'api/graph_data_units';

import { parseTimeSeries } from 'components/admin/GraphCards/VisitorsCard/useVisitors/parse';

import { Props } from '../typings';

import { parseStats } from './parse';

export default function useVisitors({
  startAt,
  endAt,
  compareStartAt,
  compareEndAt,
  resolution = 'month',
}: Props) {
  const [currentResolution, setCurrentResolution] = useState(resolution);

  const { data: analytics } = useVisitorsData(
    {
      start_at: startAt,
      end_at: endAt,
      resolution,
      compare_start_at: compareStartAt,
      compare_end_at: compareEndAt,
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
            currentResolution ?? 'month'
          )
        : null,
    [analytics?.data, startAt, endAt, currentResolution]
  );

  return { currentResolution, stats, timeSeries };
}
