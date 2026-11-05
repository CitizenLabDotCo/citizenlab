import React, { useMemo } from 'react';

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
import { NilOrError } from 'utils/helperUtils';

import { Dates, Resolution } from '../../typings';
import messages from '../messages';
import { TimeSeries } from '../useVisitors/typings';

import { generateEmptyData } from './generateEmptyData';
import renderTooltip from './renderTooltip';

type Props = Dates &
  Resolution & {
    timeSeries: TimeSeries | NilOrError;
    margin?: Margin;
    yaxis?: YAxisProps;
    innerRef?: React.RefObject<any>;
  };

const emptyLineConfig = { strokeWidths: [0, 0] };
const lineConfig = {
  strokes: [colors.categorical01, colors.categorical03],
  activeDot: { r: 4 },
};

const Chart = ({
  timeSeries,
  startAtMoment,
  endAtMoment,
  resolution,
  margin,
  yaxis,
  innerRef,
  ariaLabel,
  ariaDescribedBy,
}: Props & AccessibilityProps) => {
  const { formatMessage } = useIntl();

  const emptyData = useMemo(
    () => generateEmptyData(startAtMoment, endAtMoment, resolution),
    [startAtMoment, endAtMoment, resolution]
  );

  const legendItems: LegendItem[] = [
    {
      icon: 'circle',
      color: colors.categorical01,
      label: formatMessage(messages.visitors),
    },
    {
      icon: 'circle',
      color: colors.categorical03,
      label: formatMessage(messages.visits),
    },
  ];

  const formatTick = (date: string) => {
    return toThreeLetterMonth(date, resolution);
  };

  // Avoids unmounted component state update warning
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
        y: ['visitors', 'visits'],
      }}
      margin={margin}
      lines={noData ? emptyLineConfig : lineConfig}
      grid={{ vertical: true }}
      xaxis={{ tickFormatter: formatTick }}
      yaxis={yaxis}
      tooltip={noData ? undefined : renderTooltip(resolution)}
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
