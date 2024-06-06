import { useMemo, useState } from 'react';

import moment from 'moment';

import { useCommentsByTime as useCommentsByTimeData } from 'api/graph_data_units';

import { parseTimeSeries } from 'components/admin/GraphCards/CommentsByTimeCard/useCommentsByTime/parse';
import {
  ProjectId,
  DatesStrings,
  Resolution,
} from 'components/admin/GraphCards/typings';

type QueryParameters = ProjectId & DatesStrings & Resolution;

export default function useCommentsByTime({
  projectId,
  startAt,
  endAt,
  resolution,
}: QueryParameters) {
  const [currentResolution, setCurrentResolution] = useState(resolution);

  const { data: dataUnits } = useCommentsByTimeData(
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

  const timeSeries = useMemo(
    () =>
      dataUnits?.data
        ? parseTimeSeries(
            dataUnits.data.attributes[0],
            startAt ? moment(startAt) : null,
            endAt ? moment(endAt) : null,
            currentResolution,
            dataUnits.data.attributes[1]
          )
        : null,
    [dataUnits?.data, startAt, endAt, currentResolution]
  );

  return { currentResolution, timeSeries };
}
