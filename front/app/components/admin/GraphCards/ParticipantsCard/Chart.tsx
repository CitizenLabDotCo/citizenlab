import React, { useMemo } from 'react';

import { Dates, Resolution } from 'components/admin/GraphCards/typings';
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';
import LineChart from 'components/admin/Graphs/LineChart';
import { colors } from 'components/admin/Graphs/styling';
import {
  AccessibilityProps,
  Margin,
  YAxisProps,
} from 'components/admin/Graphs/typings';

import { useIntl } from 'utils/cl-intl';
import { toThreeLetterMonth } from 'utils/dateUtils';

import { generateEmptyData } from './generateEmptyData';
import messages from './messages';
import renderTooltip from './renderTooltip';
import { TimeSeries } from './useParticipants/typings';

type Props = Dates &
  Resolution & {
    timeSeries: TimeSeries | null;
    innerRef?: React.RefObject<any>;
    margin?: Margin;
    yaxis?: YAxisProps;
    showVisitors?: boolean;
    isAnimationActive?: boolean;
  };

const getLineConfig = (
  noData: boolean,
  showVisitors: boolean,
  isAnimationActive?: boolean
) => {
  if (noData) {
    return { strokeWidths: showVisitors ? [0, 0] : [0] };
  }
  return {
    strokes: showVisitors
      ? [colors.categorical01, colors.categorical03]
      : [colors.categorical01],
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
  showVisitors = false,
  isAnimationActive,
}: Props & AccessibilityProps) => {
  const { formatMessage } = useIntl();

  const emptyData = useMemo(
    () => generateEmptyData(startAtMoment, endAtMoment, resolution),
    [startAtMoment, endAtMoment, resolution]
  );

  const legendItems: LegendItem[] = showVisitors
    ? [
        {
          icon: 'circle',
          color: colors.categorical01,
          label: formatMessage(messages.participants),
        },
        {
          icon: 'circle',
          color: colors.categorical03,
          label: formatMessage(messages.visitors),
        },
      ]
    : [
        {
          icon: 'circle',
          color: colors.categorical01,
          label: formatMessage(messages.participants),
        },
      ];

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
        y: showVisitors ? ['participants', 'visitors'] : ['participants'],
      }}
      margin={margin}
      lines={getLineConfig(noData, showVisitors, isAnimationActive)}
      grid={{ vertical: true }}
      xaxis={{ tickFormatter: formatTick }}
      yaxis={yaxis}
      tooltip={noData ? undefined : renderTooltip(resolution, showVisitors)}
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
