import React, { useState } from 'react';

import {
  legacyColors,
  sizes,
  // animation,
} from 'components/admin/Graphs/styling';

// components
import { 
  LineChart as RechartsLineChart,
  CartesianGrid,
  Line,
  XAxis,
  YAxis,
  // Cell,
  // LabelList,
  // Tooltip,
} from 'recharts';
import Container from '../_components/Container';
import EmptyState from '../_components/EmptyState';
import Legend from '../_components/Legend';

// utils
import { hasNoData, /* getTooltipConfig, */ parseMargin } from '../utils';

// typings
import { Props } from './typings';
import {
  GraphDimensions,
  LegendDimensions,
} from '../_components/Legend/typings';

export const DEFAULT_LEGEND_OFFSET = 10;

const LineChart = <Row,>({
  width,
  height,
  data,
  margin,
  legend,
  emptyContainerContent,
  innerRef,
  xaxis,
  yaxis,
  // onMouseOver,
  // onMouseOut,
}: Props<Row>) => {
  const [graphDimensions, setGraphDimensions] = useState<
    GraphDimensions | undefined
  >();
  const [legendDimensions, setLegendDimensions] = useState<
    LegendDimensions | undefined
  >();

  if (hasNoData(data)) {
    return <EmptyState emptyContainerContent={emptyContainerContent} />;
  }

  return (
    <Container
      width={width}
      height={height}
      legend={legend}
      graphDimensions={graphDimensions}
      legendDimensions={legendDimensions}
      onUpdateGraphDimensions={setGraphDimensions}
      onUpdateLegendDimensions={setLegendDimensions}
    >
      <RechartsLineChart
        data={data}
        margin={parseMargin(
          margin,
          legend,
          legendDimensions,
          DEFAULT_LEGEND_OFFSET
        )}
        ref={innerRef}
      >
        {legend && graphDimensions && legendDimensions && (
          <g className="graph-legend">
            <Legend
              items={legend.items}
              graphDimensions={graphDimensions}
              legendDimensions={legendDimensions}
              position={legend.position}
              textColor={legend.textColor}
              margin={margin}
            />
          </g>
        )}

        <CartesianGrid />

        <XAxis
          // dataKey={layout === 'vertical' ? category : undefined}
          type="category"
          stroke={legacyColors.chartLabel}
          fontSize={sizes.chartLabel}
          tick={{ transform: 'translate(0, 7)' }}
          {...xaxis}
        />
        <YAxis
          // dataKey={layout === 'horizontal' ? category : undefined}
          type="number"
          stroke={legacyColors.chartLabel}
          fontSize={sizes.chartLabel}
          {...yaxis}
        />
      </RechartsLineChart>
    </Container>
  )
}

export default LineChart;
