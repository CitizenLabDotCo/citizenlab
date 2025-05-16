import React from 'react';

import MultiBarChart from 'components/admin/Graphs/MultiBarChart';
import {
  colors,
  DEFAULT_BAR_CHART_MARGIN,
} from 'components/admin/Graphs/styling';

import { RepresentativenessData } from '../../../../hooks/parseReferenceData';

import renderTooltip from './renderTooltip';
import { formatPercentage, emptyString } from './utils';

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
