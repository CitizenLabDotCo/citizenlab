import React, { useState } from 'react';

import {
  PieChart as RechartsPieChart,
  Tooltip,
  Pie,
  Cell,
  Label,
} from 'recharts';

import { AccessibilityProps } from 'components/admin/Graphs/typings';
import { getRechartsAccessibilityProps } from 'components/admin/Graphs/utils';

import Container from '../_components/Container';
import EmptyState from '../_components/EmptyState';
import Legend from '../_components/Legend';
import {
  GraphDimensions,
  LegendDimensions,
} from '../_components/Legend/typings';
import { animation } from '../styling';
import { hasNoData, getTooltipConfig, parseMargin } from '../utils';

import { Props } from './typings';
import { getPieConfig } from './utils';

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
  ariaLabel,
  ariaDescribedBy,
}: Props<Row> & AccessibilityProps) => {
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
        {...getRechartsAccessibilityProps(ariaLabel, ariaDescribedBy)}
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
          // Recharts expects ChartDataInput (Record<string, unknown>[]) but TS interfaces
          // don't satisfy index signatures. The cast is safe as our data is always objects.
          data={data as Record<string, unknown>[]}
          animationDuration={animation.duration}
          animationBegin={animation.begin}
          {...pieConfig.props}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          {pieConfig.cells.map((cell, cellIndex) => (
            <Cell key={`cell-${cellIndex}`} {...cell} />
          ))}

          {centerLabel && <Label content={centerLabel} />}
        </Pie>
      </RechartsPieChart>
    </Container>
  );
};

export default PieChart;
