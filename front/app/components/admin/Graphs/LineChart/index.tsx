import React, { useState } from 'react';

import {
  legacyColors,
  sizes,
  animation,
} from 'components/admin/Graphs/styling';

// components
import {
  LineChart as RechartsLineChart,
  CartesianGrid,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import Container from '../_components/Container';
import EmptyState from '../_components/EmptyState';
import Legend from '../_components/Legend';

// utils
import { getLineConfigs } from './utils';
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
  mapping,
  lines,
  margin,
  xaxis,
  yaxis,
  tooltip,
  legend,
  grid,
  emptyContainerContent,
  innerRef,
  onMouseOver,
  onMouseOut,
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

  const x = mapping.x;
  if (typeof x === 'symbol') return null;

  const lineConfigs = getLineConfigs(mapping, lines);
  const tooltipConfig = getTooltipConfig(tooltip);

  const handleMouseOver =
    (lineIndex: number) => (_, event: React.MouseEvent) => {
      onMouseOver && onMouseOver({ lineIndex }, event);
    };

  const handleMouseOut =
    (lineIndex: number) => (_, event: React.MouseEvent) => {
      onMouseOut && onMouseOut({ lineIndex }, event);
    };

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

        {(typeof tooltip === 'object' || tooltip === true) && (
          <Tooltip {...tooltipConfig} />
        )}
        {typeof tooltip === 'function' && tooltip(tooltipConfig)}

        {grid && (
          <CartesianGrid
            horizontal={!!grid.horizontal}
            vertical={!!grid.vertical}
          />
        )}

        {lineConfigs.map((lineConfig, lineIndex) => (
          <Line
            {...lineConfig.props}
            animationDuration={animation.duration}
            animationBegin={animation.begin}
            key={lineIndex}
            onMouseOver={handleMouseOver(lineIndex)}
            onMouseOut={handleMouseOut(lineIndex)}
          />
        ))}

        <XAxis
          dataKey={x}
          type="category"
          stroke={legacyColors.chartLabel}
          fontSize={sizes.chartLabel}
          tick={{ transform: 'translate(0, 7)' }}
          {...xaxis}
        />
        <YAxis
          type="number"
          stroke={legacyColors.chartLabel}
          fontSize={sizes.chartLabel}
          {...yaxis}
        />
      </RechartsLineChart>
    </Container>
  );
};

export default LineChart;
