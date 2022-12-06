import React from 'react';
// typings
import { RepresentativenessData } from '../../hooks/createRefDataSubscription';
// utils
import { formatPercentage, emptyString } from './utils';
// components
import MultiBarChart from 'components/admin/Graphs/MultiBarChart';
// styling
import {
  colors,
  DEFAULT_BAR_CHART_MARGIN,
} from 'components/admin/Graphs/styling';
import renderTooltip from './renderTooltip';

interface Props {
  currentChartRef: React.RefObject<SVGElement | undefined>;
  data: RepresentativenessData;
  barNames: string[];
  hideTicks: boolean;
}

const BAR_FILLS = [colors.blue, colors.lightBlue];

const Chart = ({ currentChartRef, data, barNames, hideTicks }: Props) => {
  const hideLabels = data.length > 10;
  const slicedData = data.slice(0, 24);

  return (
    <MultiBarChart
      height={300}
      innerRef={currentChartRef}
      data={slicedData}
      mapping={{
        category: 'name',
        length: ['actualPercentage', 'referencePercentage'],
        fill: ({ barIndex }) => BAR_FILLS[barIndex],
      }}
      bars={{
        names: barNames,
        categoryGap: '20%',
      }}
      margin={DEFAULT_BAR_CHART_MARGIN}
      xaxis={
        hideTicks ? { tickFormatter: emptyString, tickLine: false } : undefined
      }
      yaxis={{ tickFormatter: formatPercentage }}
      labels={hideLabels ? undefined : { formatter: formatPercentage }}
      tooltip={renderTooltip}
    />
  );
};

export default Chart;
