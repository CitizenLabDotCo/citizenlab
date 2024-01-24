// hooks
import { useMemo, useState } from 'react';
import { useCommentsByTime as useCommentsByTimeData } from 'api/graph_data_units';

// parse
import { parseTimeSeries } from 'components/admin/GraphCards/CommentsByTimeCard/useCommentsByTime/parse';

// typings
import { QueryParameters } from 'components/admin/GraphCards/CommentsByTimeCard/useCommentsByTime/typings';

export default function useCommentsByTime({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: QueryParameters) {
  const [currentResolution, setCurrentResolution] = useState(resolution);

  const dataUnits = useCommentsByTimeData(
    {
      projectId,
      startAtMoment,
      endAtMoment,
      resolution,
    },
    {
      onSuccess: () => setCurrentResolution(resolution),
    }
  );

  const timeSeries = useMemo(
    () =>
      dataUnits?.data
        ? parseTimeSeries(
            dataUnits.data.attributes[0],
            startAtMoment,
            endAtMoment,
            currentResolution,
            dataUnits.data.attributes[1]
          )
        : null,
    [dataUnits?.data, startAtMoment, endAtMoment, currentResolution]
  );

  return { currentResolution, timeSeries };
}
