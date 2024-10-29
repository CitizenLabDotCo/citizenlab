import React, { useMemo } from 'react';

import { Dates, Resolution } from 'components/admin/GraphCards/typings';
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';
import LineChart from 'components/admin/Graphs/LineChart';
import { colors } from 'components/admin/Graphs/styling';
import { Margin, YAxisProps } from 'components/admin/Graphs/typings';

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
  };

const emptyLineConfig = { strokeWidths: [0] };
const lineConfig = {
  strokes: [colors.categorical01],
  activeDot: { r: 4 },
};

const Chart = ({
  timeSeries,
  startAtMoment,
  endAtMoment,
  resolution,
  innerRef,
  margin,
  yaxis,
}: Props) => {
  const { formatMessage } = useIntl();

  const emptyData = useMemo(
    () => generateEmptyData(startAtMoment, endAtMoment, resolution),
    [startAtMoment, endAtMoment, resolution]
  );

  const legendItems: LegendItem[] = [
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

  return (
    <LineChart
      width="100%"
      height="100%"
      data={noData ? emptyData : timeSeries}
      mapping={{
        x: 'date',
        y: ['participants'],
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
    />
  );
};

export default Chart;
