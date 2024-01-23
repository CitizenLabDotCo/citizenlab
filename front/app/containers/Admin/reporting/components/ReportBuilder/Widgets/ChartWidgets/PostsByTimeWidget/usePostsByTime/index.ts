import { useMemo, useState } from 'react';

// hooks
import useGraphDataUnits from 'api/graph_data_units/useGraphDataUnits';
// parse
import { parseTimeSeries } from 'components/admin/GraphCards/PostsByTimeCard/usePostsByTime/parse';

// typings
import {
  QueryParameters,
  Response,
} from 'components/admin/GraphCards/PostsByTimeCard/usePostsByTime/typings';

export default function usePostsByTime({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const [currentResolution] = useState(resolution);

  const analytics = useGraphDataUnits<Response>({
    resolvedName: 'PostsByTimeWidget',
    props: {
      projectId,
      startAtMoment,
      endAtMoment,
      resolution,
    },
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
