import React, { useMemo } from 'react';

// styling
import { colors } from 'components/admin/Graphs/styling';

// components
import LineChart from 'components/admin/Graphs/LineChart';
import renderTooltip from './renderTooltip';

// i18n
import messages from '../messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { toThreeLetterMonth } from 'utils/dateUtils';
import { generateEmptyData } from './generateEmptyData';

// typings
import { Moment } from 'moment';
import { IResolution } from 'components/admin/ResolutionControl';
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';
import { TimeSeries } from '../../../hooks/useVisitors/typings';

interface Props {
  timeSeries: TimeSeries | NilOrError;
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null | undefined;
  resolution: IResolution;
  innerRef: React.RefObject<any>;
}

const Chart = ({
  timeSeries,
  startAtMoment,
  endAtMoment,
  resolution,
  innerRef,
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
      lines={
        noData
          ? {
              strokeWidths: [0, 0],
            }
          : {
              strokes: [colors.categorical01, colors.categorical03],
              activeDot: { r: 4 },
            }
      }
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
