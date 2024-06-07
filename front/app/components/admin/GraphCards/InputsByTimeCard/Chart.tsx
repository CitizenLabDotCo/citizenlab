import React, { useMemo } from 'react';

import { MARGINS } from 'components/admin/GraphCards/_utils/style';
import { Dates, Resolution, Layout } from 'components/admin/GraphCards/typings';
import LineBarChart from 'components/admin/Graphs/LineBarChart';

import { toThreeLetterMonth } from 'utils/dateUtils';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

import { generateEmptyData } from './generateEmptyData';
import { TimeSeries } from './useInputsByTime/typings';

type Props = Dates &
  Resolution & {
    timeSeries: TimeSeries | NilOrError;
    innerRef?: React.RefObject<any>;
    layout?: Layout;
  };

const Chart = ({
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

  const noData = isNilOrError(timeSeries);

  return (
    <LineBarChart
      width="100%"
      height="100%"
      data={noData ? emptyData : timeSeries}
      mapping={{
        x: 'date',
        yBars: ['inputs'],
        yLine: 'total',
      }}
      margin={MARGINS[layout]}
      xaxis={{ tickFormatter: formatTick }}
      resolution={resolution}
      innerRef={noData ? undefined : innerRef}
    />
  );
};

export default Chart;
