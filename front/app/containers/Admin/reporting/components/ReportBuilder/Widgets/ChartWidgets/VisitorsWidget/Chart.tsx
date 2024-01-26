import React, { useMemo } from 'react';

// styling
import { colors } from 'components/admin/Graphs/styling';

// components
import LineChart from 'components/admin/Graphs/LineChart';
import renderTooltip from 'components/admin/GraphCards/VisitorsCard/Chart/renderTooltip';

// i18n
import messages from 'components/admin/GraphCards/VisitorsCard/messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { toThreeLetterMonth } from 'utils/dateUtils';
import { formatLargeNumber } from '../utils';
import { generateEmptyData } from 'components/admin/GraphCards/VisitorsCard/Chart/generateEmptyData';

// typings
import { Dates, Layout, Resolution } from 'components/admin/GraphCards/typings';
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';
import { TimeSeries } from 'components/admin/GraphCards/VisitorsCard/useVisitors/typings';

type Props = Dates &
  Resolution & {
    timeSeries: TimeSeries | NilOrError;
    layout?: Layout;
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

  const noData = isNilOrError(timeSeries);

  return (
    <LineChart
      width="100%"
      height="100%"
      data={noData ? emptyData : timeSeries}
      mapping={{
        x: 'date',
        y: ['visitors', 'visits'],
      }}
      margin={
        layout === 'narrow'
          ? {
              left: 5,
              right: -20,
              top: 0,
              bottom: 0,
            }
          : undefined
      }
      lines={noData ? emptyLineConfig : lineConfig}
      grid={{ vertical: true }}
      xaxis={{ tickFormatter: formatTick }}
      yaxis={{
        orientation: layout === 'narrow' ? 'right' : 'left',
        tickFormatter: formatLargeNumber,
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
