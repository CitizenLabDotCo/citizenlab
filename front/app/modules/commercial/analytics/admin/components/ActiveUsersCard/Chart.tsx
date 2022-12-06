import React, { useMemo } from 'react';
import { TimeSeries } from '../../hooks/useActiveUsers/typings';
import { useIntl } from 'utils/cl-intl';
import { toThreeLetterMonth } from 'utils/dateUtils';
// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
// components
import LineChart from 'components/admin/Graphs/LineChart';
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';
// styling
import { colors } from 'components/admin/Graphs/styling';
// typings
import { Dates, Resolution, Layout } from '../../typings';
import { MARGINS } from '../RegistrationsCard/Chart';
import { generateEmptyData } from './generateEmptyData';
// i18n
import messages from './messages';
import renderTooltip from './renderTooltip';

type Props = Dates &
  Resolution & {
    timeSeries: TimeSeries | NilOrError;
    innerRef: React.RefObject<any>;
    layout?: Layout;
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
      label: formatMessage(messages.activeUsers),
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
        y: ['activeUsers'],
      }}
      margin={MARGINS[layout]}
      lines={noData ? emptyLineConfig : lineConfig}
      grid={{ vertical: true }}
      xaxis={{ tickFormatter: formatTick }}
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
