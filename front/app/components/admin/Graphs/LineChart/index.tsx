import React, { useState } from 'react';

// components
import { 
  LineChart as RechartsLineChart,
  CartesianGrid,
  Line,
  XAxis,
  YAxis,
  Cell,
  LabelList,
  Tooltip,
} from 'recharts';
import Container from '../_components/Container';
import EmptyState from '../_components/EmptyState';
import Legend from '../_components/Legend';

// utils
import { hasNoData, getTooltipConfig, parseMargin } from '../utils';

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
  innerRef
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
        <CartesianGrid />

      </RechartsLineChart>
    </Container>
  )
}

export default LineChart;
