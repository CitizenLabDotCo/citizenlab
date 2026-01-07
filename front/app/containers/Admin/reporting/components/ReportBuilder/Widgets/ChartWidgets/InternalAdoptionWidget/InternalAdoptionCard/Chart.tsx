import React, { useMemo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { Dates, Resolution } from 'components/admin/GraphCards/typings';
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';
import LineChart from 'components/admin/Graphs/LineChart';
import { colors } from 'components/admin/Graphs/styling';
import {
  Margin,
  YAxisProps,
  AccessibilityProps,
} from 'components/admin/Graphs/typings';

import { useIntl } from 'utils/cl-intl';
import { toThreeLetterMonth } from 'utils/dateUtils';

import messages from '../messages';
import { CombinedTimeSeriesRow, Stats } from '../typings';

import { generateEmptyData } from './generateEmptyData';
import renderTooltip from './renderTooltip';
import { Statistics } from './Statistics';

export interface Props extends Dates, Resolution, AccessibilityProps {
  timeSeries: CombinedTimeSeriesRow[] | null;
  hideStatistics: boolean;
  stats: Stats | null;
  previousDays?: number;
  innerRef?: React.RefObject<any>;
  margin?: Margin;
  yaxis?: YAxisProps;
}

const EMPTY_LINE_CONFIG = { strokeWidths: [0] };

const LINE_CONFIG = {
  strokes: [colors.categorical01, colors.categorical03, colors.categorical07],
  activeDot: { r: 4 },
};

const LEGEND_ITEMS = {
  totalActive: {
    color: colors.categorical01,
    message: messages.total,
  },
  activeAdmins: {
    color: colors.categorical03,
    message: messages.activeAdmins,
  },
  activeModerators: {
    color: colors.categorical07,
    message: messages.activeModerators,
  },
};

const METRIC_TYPES: ('totalActive' | 'activeAdmins' | 'activeModerators')[] = [
  'totalActive',
  'activeAdmins',
  'activeModerators',
];

const Chart = ({
  hideStatistics,
  timeSeries,
  stats,
  startAtMoment,
  endAtMoment,
  resolution,
  previousDays,
  innerRef,
  margin,
  yaxis,
  ariaLabel,
  ariaDescribedBy,
}: Props) => {
  const { formatMessage } = useIntl();

  const emptyData = useMemo(
    () => generateEmptyData(startAtMoment, endAtMoment, resolution),
    [startAtMoment, endAtMoment, resolution]
  );

  const legendItems: LegendItem[] = METRIC_TYPES.map((type) => {
    const { color, message } = LEGEND_ITEMS[type];

    return {
      icon: 'circle',
      color,
      label: formatMessage(message),
    };
  });

  const formatTick = (date: string) => {
    return toThreeLetterMonth(date, resolution);
  };

  // Avoids unmounted component state update warning
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (timeSeries === undefined) {
    return null;
  }

  const noData = timeSeries === null;

  return (
    <Box className="e2e-internal-adoption-widget" height="100%">
      {!hideStatistics && stats && (
        <Statistics stats={stats} previousDays={previousDays} />
      )}
      <Box
        flexGrow={1}
        display="flex"
        justifyContent="flex-start"
        mt="28px"
        maxWidth="800px"
        h="240px"
      >
        <LineChart
          width="100%"
          height="100%"
          data={noData ? emptyData : timeSeries}
          mapping={{
            x: 'date',
            y: METRIC_TYPES,
          }}
          margin={margin}
          lines={noData ? EMPTY_LINE_CONFIG : LINE_CONFIG}
          grid={{ vertical: true }}
          xaxis={{ tickFormatter: formatTick }}
          yaxis={yaxis}
          tooltip={noData ? undefined : renderTooltip(resolution)}
          legend={{
            marginTop: 16,
            items: legendItems,
          }}
          innerRef={noData ? undefined : innerRef}
          ariaLabel={ariaLabel}
          ariaDescribedBy={ariaDescribedBy}
        />
      </Box>
    </Box>
  );
};

export default Chart;
