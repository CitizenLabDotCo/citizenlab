// hooks
import { useMemo, useState } from 'react';
import useGraphDataUnits from 'api/graph_data_units/useGraphDataUnits';

// parse
import { parseTimeSeries } from 'components/admin/GraphCards/CommentsByTimeCard/useCommentsByTime/parse';

// typings
import {
  QueryParameters,
  Response,
} from 'components/admin/GraphCards/CommentsByTimeCard/useCommentsByTime/typings';

export default function useCommentsByTime({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const [currentResolution, setCurrentResolution] = useState(resolution);

  const analytics = useGraphDataUnits<Response>({
    resolvedName: 'CommentsByTimeWidget',
    queryParameters: {
      projectId,
      startAtMoment,
      endAtMoment,
      resolution,
    },
    onSuccess: () => setCurrentResolution(resolution),
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
