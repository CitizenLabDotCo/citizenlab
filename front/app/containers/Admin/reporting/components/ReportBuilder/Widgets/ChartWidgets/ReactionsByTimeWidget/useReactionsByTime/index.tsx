import { useMemo, useState } from 'react';

import { useReactionsByTime } from 'api/graph_data_units';

import { parseTimeSeries } from 'components/admin/GraphCards/ReactionsByTimeCard/useReactionsByTime/parse';
import { QueryParameters } from 'components/admin/GraphCards/ReactionsByTimeCard/useReactionsByTime/typings';

export default function useReactionsByTime123({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const [currentResolution] = useState(resolution);

  const analytics = useReactionsByTime({
    projectId,
    startAtMoment,
    endAtMoment,
    resolution,
  });

  const timeSeries = useMemo(
    () =>
      analytics?.data
        ? parseTimeSeries(
            analytics.data.attributes[0],
            startAtMoment,
            endAtMoment,
            currentResolution,
            analytics.data.attributes[1]
          )
        : null,
    [analytics?.data, startAtMoment, endAtMoment, currentResolution]
  );

  return { currentResolution, timeSeries };
}
