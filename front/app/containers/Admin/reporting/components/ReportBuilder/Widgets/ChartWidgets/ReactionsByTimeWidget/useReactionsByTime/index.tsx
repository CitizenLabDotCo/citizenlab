import { useMemo, useState } from 'react';

import moment from 'moment';

import { useReactionsByTime as useReactionsByTimeData } from 'api/graph_data_units';

import { parseTimeSeries } from 'components/admin/GraphCards/ReactionsByTimeCard/useReactionsByTime/parse';
import {
  ProjectId,
  DatesStrings,
  Resolution,
} from 'components/admin/GraphCards/typings';

type QueryParameters = ProjectId & DatesStrings & Resolution;

export default function useReactionsByTime({
  projectId,
  startAt,
  endAt,
  resolution,
}: QueryParameters) {
  const [currentResolution] = useState(resolution);

  const { data: analytics } = useReactionsByTimeData({
    project_id: projectId,
    start_at: startAt,
    end_at: endAt,
    resolution,
  });

  const timeSeries = useMemo(
    () =>
      analytics?.data
        ? parseTimeSeries(
            analytics.data.attributes[0],
            startAt ? moment(startAt) : null,
            endAt ? moment(endAt) : null,
            currentResolution,
            analytics.data.attributes[1]
          )
        : null,
    [analytics?.data, startAt, endAt, currentResolution]
  );

  return { currentResolution, timeSeries };
}
