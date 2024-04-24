import React, { useMemo } from 'react';

import { generateEmptyData } from 'components/admin/GraphCards/ActiveUsersCard/generateEmptyData';
import messages from 'components/admin/GraphCards/ActiveUsersCard/messages';
import renderTooltip from 'components/admin/GraphCards/ActiveUsersCard/renderTooltip';
import { Dates, Resolution, Layout } from 'components/admin/GraphCards/typings';
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';
import LineChart from 'components/admin/Graphs/LineChart';
import { colors } from 'components/admin/Graphs/styling';

import { useIntl } from 'utils/cl-intl';
import { toThreeLetterMonth } from 'utils/dateUtils';

import { TimeSeries } from './useActiveUsers/typings';

type Props = Dates &
  Resolution & {
    timeSeries: TimeSeries | null;
    layout?: Layout;
  };

const emptyLineConfig = { strokeWidths: [0] };
const lineConfig = {
  strokes: [colors.categorical01],
  activeDot: { r: 4 },
};

const MARGINS = {
  wide: {
    top: 10,
  },
  narrow: {
    right: -20,
  },
} as const;

const Chart = ({
  timeSeries,
  startAtMoment,
  endAtMoment,
  resolution,
  layout = 'wide',
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
        y: ['activeUsers'],
      }}
      margin={MARGINS[layout]}
      lines={noData ? emptyLineConfig : lineConfig}
      grid={{ vertical: true }}
      xaxis={{ tickFormatter: formatTick }}
      yaxis={{
        orientation: layout === 'narrow' ? 'right' : 'left',
      }}
      tooltip={noData ? undefined : renderTooltip(resolution)}
      legend={{
        marginTop: 16,
        items: legendItems,
      }}
    />
  );
};

export default Chart;
