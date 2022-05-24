import React from 'react';

// hooks
import { useTheme } from 'styled-components';

// components
import MultiBarChart from 'components/admin/Graphs/MultiBarChart';
import { DEFAULT_BAR_CHART_MARGIN } from 'components/admin/Graphs/constants';
import { LabelList, Tooltip } from 'recharts';

// styling
import { colors } from 'utils/styleUtils';

// utils
import { formatPercentage, formatTooltipValues, emptyString } from './utils';

// typings
import { RepresentativenessData } from './';

interface Props {
  currentChartRef: React.RefObject<SVGElement | undefined>;
  data: RepresentativenessData;
  barNames: string[];
  hideTicks: boolean;
}

const Chart = ({ currentChartRef, data, barNames, hideTicks }: Props) => {
  const { newBarFill }: any = useTheme();

  const hideLabels = data.length > 10;
  const slicedData = data.slice(0, 24);

  return (
    <MultiBarChart
      height={300}
      innerRef={currentChartRef}
      data={slicedData}
      mapping={{ length: ['actualPercentage', 'referencePercentage'] }}
      bars={{
        name: barNames,
        fill: [newBarFill, colors.clBlue],
        categoryGap: '20%',
      }}
      margin={DEFAULT_BAR_CHART_MARGIN}
      xaxis={
        hideTicks ? { tickFormatter: emptyString, tickLine: false } : undefined
      }
      yaxis={{ tickFormatter: formatPercentage }}
      renderLabels={
        hideLabels
          ? undefined
          : (props) => <LabelList {...props} formatter={formatPercentage} />
      }
      renderTooltip={(props) => (
        <Tooltip {...props} formatter={formatTooltipValues} />
      )}
    />
  );
};

export default Chart;
