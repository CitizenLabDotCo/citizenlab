import React, { useMemo } from 'react';

// styling
import { MARGINS } from 'components/admin/GraphCards/_utils/style';

// components
import LineBarChart from 'components/admin/Graphs/LineBarChart';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { toThreeLetterMonth } from 'utils/dateUtils';
import { generateEmptyData } from './generateEmptyData';

// typings
import {
  Dates,
  Resolution,
  Layout,
  ProjectId,
} from 'components/admin/GraphCards/typings';
import { TimeSeries } from './useRegistrationsByTime/typings';

type Props = ProjectId &
  Dates &
  Resolution & {
    timeSeries: TimeSeries | NilOrError;
    innerRef: React.RefObject<any>;
    layout?: Layout;
  };

const Chart = ({
  projectId,
  timeSeries,
  startAtMoment,
  endAtMoment,
  resolution,
  innerRef,
  layout = 'wide',
}: Props) => {
  const emptyData = useMemo(
    () => generateEmptyData(startAtMoment, endAtMoment, resolution),
    [startAtMoment, endAtMoment, resolution]
  );

  const formatTick = (date: string) => {
    return toThreeLetterMonth(date, resolution);
  };

  // Avoids unmounted component state update warning
  if (timeSeries === undefined) {
    return null;
  }

  const noData = isNilOrError(timeSeries) || !!projectId;

  return (
    <LineBarChart
      width="100%"
      height="100%"
      data={noData ? emptyData : timeSeries}
      mapping={{
        x: 'date',
        y: ['registrations'],
      }}
      margin={MARGINS[layout]}
      xaxis={{ tickFormatter: formatTick }}
      resolution={resolution}
      innerRef={noData ? undefined : innerRef}
    />
  );
};

export default Chart;
