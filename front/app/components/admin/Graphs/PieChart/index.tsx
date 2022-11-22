import React, { useState } from 'react';

// styling
import { animation } from '../styling';

// components
import {
  Cell,
  Label,
  Pie,
  PieChart as RechartsPieChart,
  Tooltip,
} from 'recharts';
import Container from '../_components/Container';
import EmptyState from '../_components/EmptyState';
import Legend from '../_components/Legend';

// utils
import { getTooltipConfig, hasNoData, parseMargin } from '../utils';
import { getPieConfig } from './utils';

// typings
import {
  GraphDimensions,
  LegendDimensions,
} from '../_components/Legend/typings';
import { Props } from './typings';

const DEFAULT_LEGEND_OFFSET = 16;

const PieChart = <Row,>({
  width,
  height,
  data,
  mapping,
  pie,
  margin,
  tooltip,
  centerLabel,
  legend,
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

  const pieConfig = getPieConfig(data, mapping, pie);
  const tooltipConfig = getTooltipConfig(tooltip);

  const handleMouseOver = (_, rowIndex: number, event: React.MouseEvent) => {
    onMouseOver && onMouseOver({ row: data[rowIndex], rowIndex }, event);
  };

  const handleMouseOut = (_, rowIndex: number, event: React.MouseEvent) => {
    onMouseOut && onMouseOut({ row: data[rowIndex], rowIndex }, event);
  };

  return (
    <Container
      width={width}
      height={height}
      legend={legend}
      graphDimensions={graphDimensions}
      legendDimensions={legendDimensions}
      defaultLegendOffset={DEFAULT_LEGEND_OFFSET}
      onUpdateGraphDimensions={setGraphDimensions}
      onUpdateLegendDimensions={setLegendDimensions}
    >
      <RechartsPieChart
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

        <Pie
          data={data}
          animationDuration={animation.duration}
          animationBegin={animation.begin}
          {...pieConfig.props}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          {pieConfig.cells.map((cell, cellIndex) => (
            <Cell key={`cell-${cellIndex}`} {...cell} />
          ))}

          {centerLabel && <Label content={centerLabel} position="center" />}
        </Pie>
      </RechartsPieChart>
    </Container>
  );
};

export default PieChart;
