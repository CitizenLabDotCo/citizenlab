import React, { useMemo } from 'react';

import { Dates, Resolution } from 'components/admin/GraphCards/typings';
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';
import LineChart from 'components/admin/Graphs/LineChart';
import {
  AccessibilityProps,
  Margin,
  YAxisProps,
} from 'components/admin/Graphs/typings';

import { useIntl } from 'utils/cl-intl';
import { toThreeLetterMonth } from 'utils/dateUtils';

import { generateEmptyData } from './generateEmptyData';
import renderTooltip from './renderTooltip';
import { SERIES, SeriesKey } from './series';
import { TimeSeries } from './useParticipants/typings';

type Props = Dates &
  Resolution & {
    timeSeries: TimeSeries | null;
    innerRef?: React.RefObject<any>;
    margin?: Margin;
    yaxis?: YAxisProps;
    showParticipants?: boolean;
    showVisitors?: boolean;
    isAnimationActive?: boolean;
  };

const getLineConfig = (
  noData: boolean,
  series: SeriesKey[],
  isAnimationActive?: boolean
) => {
  if (noData) {
    return { strokeWidths: series.map(() => 0) };
  }
  return {
    strokes: series.map((key) => SERIES[key].color),
    activeDot: { r: 4 },
    isAnimationActive,
  };
};

const Chart = ({
  timeSeries,
  startAtMoment,
  endAtMoment,
  resolution,
  innerRef,
  margin,
  yaxis,
  ariaLabel,
  ariaDescribedBy,
  showParticipants = true,
  showVisitors = false,
  isAnimationActive,
}: Props & AccessibilityProps) => {
  const { formatMessage } = useIntl();

  const series: SeriesKey[] = [
    ...(showParticipants ? (['participants'] as const) : []),
    ...(showVisitors ? (['visitors'] as const) : []),
  ];

  const emptyData = useMemo(
    () => generateEmptyData(startAtMoment, endAtMoment, resolution),
    [startAtMoment, endAtMoment, resolution]
  );

  const legendItems: LegendItem[] = series.map((key) => ({
    icon: 'circle',
    color: SERIES[key].color,
    label: formatMessage(SERIES[key].label),
  }));

  const formatTick = (date: string) => {
    return toThreeLetterMonth(date, resolution);
  };

  // Avoids unmounted component state update warning
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (timeSeries === undefined) {
    return null;
  }

  const noData = timeSeries === null;
  const accessibilityProps = {
    ariaLabel,
    ariaDescribedBy,
  };

  return (
    <LineChart
      width="100%"
      height="100%"
      data={noData ? emptyData : timeSeries}
      mapping={{
        x: 'date',
        y: series,
      }}
      margin={margin}
      lines={getLineConfig(noData, series, isAnimationActive)}
      grid={{ vertical: true }}
      xaxis={{ tickFormatter: formatTick }}
      yaxis={yaxis}
      tooltip={noData ? undefined : renderTooltip(resolution, series)}
      legend={{
        marginTop: 16,
        items: legendItems,
      }}
      innerRef={noData ? undefined : innerRef}
      {...accessibilityProps}
    />
  );
};

export default Chart;
