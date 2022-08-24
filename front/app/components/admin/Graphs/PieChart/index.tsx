import React, { useState } from 'react';

// styling
import { animation } from '../styling';

// components
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Tooltip,
  Pie,
  Cell,
  Label,
} from 'recharts';
import EmptyState from '../_components/EmptyState';
import Legend from '../_components/Legend';
import FakeLegend from '../_components/Legend/FakeLegend';

// utils
import { getPieConfig } from './utils';
import { hasNoData, getTooltipConfig, parseMargin } from '../utils';

// typings
import { Props } from './typings';
import {
  GraphDimensions,
  LegendDimensions,
} from '../_components/Legend/typings';

const PieChart = <Row,>({
  width,
  height,
  data,
  mapping,
  pie,
  margin,
  annotations,
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

  const pieConfig = getPieConfig(data, mapping, pie, annotations);
  const tooltipConfig = getTooltipConfig(tooltip);

  const handleMouseOver = (_, rowIndex: number, event: React.MouseEvent) => {
    onMouseOver && onMouseOver({ row: data[rowIndex], rowIndex }, event);
  };

  const handleMouseOut = (_, rowIndex: number, event: React.MouseEvent) => {
    onMouseOut && onMouseOut({ row: data[rowIndex], rowIndex }, event);
  };

  const handleRef = (ref: React.RefObject<HTMLDivElement>) => {
    if (graphDimensions || ref === null) return;

    const node = ref.current;
    if (node === null) return;

    setGraphDimensions({
      width: node.clientWidth,
      height: node.clientHeight,
    });
  };

  return (
    <>
      <ResponsiveContainer width={width} height={height} ref={handleRef}>
        <RechartsPieChart
          margin={parseMargin(margin, legend ? legendDimensions : undefined)}
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
            <Label content={centerLabel} position="center" />
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>

      {legend && (
        <FakeLegend
          items={legend.items}
          position={legend.position}
          onCalculateDimensions={setLegendDimensions}
        />
      )}
    </>
  );
};

export default PieChart;
