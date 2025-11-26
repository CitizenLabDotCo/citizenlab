import React, { useMemo } from 'react';

import { ParticipationType } from 'api/graph_data_units/requestTypes';

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
import { CombinedTimeSeriesRow } from '../typings';

import { generateEmptyData } from './generateEmptyData';
import renderTooltip from './renderTooltip';

type Props = Dates &
  Resolution &
  AccessibilityProps & {
    timeSeries: CombinedTimeSeriesRow[] | null;
    innerRef?: React.RefObject<any>;
    margin?: Margin;
    yaxis?: YAxisProps;
    participationTypes: Record<ParticipationType, boolean>;
  };

const emptyLineConfig = { strokeWidths: [0] };

const LEGEND_ITEMS = {
  inputs: {
    color: colors.categorical01,
    message: messages.inputs,
  },
  comments: {
    color: colors.categorical05,
    message: messages.comments,
  },
  votes: {
    color: colors.categorical03,
    message: messages.votes,
  },
};

const PARTICIPATION_TYPES: ParticipationType[] = [
  'inputs',
  'comments',
  'votes',
];

const Chart = ({
  timeSeries,
  startAtMoment,
  endAtMoment,
  resolution,
  innerRef,
  margin,
  yaxis,
  participationTypes,
  ariaLabel,
  ariaDescribedBy,
}: Props & AccessibilityProps) => {
  const { formatMessage } = useIntl();

  const emptyData = useMemo(
    () => generateEmptyData(startAtMoment, endAtMoment, resolution),
    [startAtMoment, endAtMoment, resolution]
  );

  const visibleParticipationTypes = PARTICIPATION_TYPES.filter(
    (type) => participationTypes[type]
  );

  const lineConfig = {
    strokes: visibleParticipationTypes.map((type) => LEGEND_ITEMS[type].color),
    activeDot: { r: 4 },
  };

  const legendItems: LegendItem[] = visibleParticipationTypes.map((type) => {
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
        y: visibleParticipationTypes,
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
