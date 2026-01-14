import React, { useState } from 'react';

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  LabelList,
  Tooltip,
} from 'recharts';

import {
  legacyColors,
  sizes,
  animation,
} from 'components/admin/Graphs/styling';
import { getRechartsAccessibilityProps } from 'components/admin/Graphs/utils';

import { truncate } from 'utils/textUtils';

import Container from '../_components/Container';
import EmptyState from '../_components/EmptyState';
import Legend from '../_components/Legend';
import {
  GraphDimensions,
  LegendDimensions,
} from '../_components/Legend/typings';
import { AccessibilityProps } from '../typings';
import { hasNoData, getTooltipConfig, parseMargin } from '../utils';

import { Props } from './typings';
import { getBarConfigs, getRechartsLayout, getLabelConfig } from './utils';
export const DEFAULT_LEGEND_OFFSET = 10;

const MultiBarChart = <Row,>({
  width,
  height,
  data,
  mapping,
  bars,
  layout = 'vertical',
  margin,
  xaxis,
  yaxis,
  labels,
  tooltip,
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

  const barConfigs = getBarConfigs(data, mapping, bars);
  const rechartsLayout = getRechartsLayout(layout);

  const category = mapping.category;
  if (typeof category === 'symbol') return null;

  const labelPosition = layout === 'vertical' ? 'top' : 'right';
  const labelConfig = getLabelConfig(labels, labelPosition);
  const tooltipConfig = getTooltipConfig(tooltip);

  const handleMouseOver =
    (barIndex: number) => (_, rowIndex: number, event: React.MouseEvent) => {
      onMouseOver &&
        onMouseOver(
          {
            row: data[rowIndex],
            rowIndex,
            barIndex,
          },
          event
        );
    };

  const handleMouseOut =
    (barIndex: number) => (_, rowIndex: number, event: React.MouseEvent) => {
      onMouseOut &&
        onMouseOut(
          {
            row: data[rowIndex],
            rowIndex,
            barIndex,
          },
          event
        );
    };

  const tickFormatter = (value: string) => {
    return truncate(value, 42);
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
      <RechartsBarChart
        data={data}
        layout={rechartsLayout}
        margin={parseMargin(
          margin,
          legend,
          legendDimensions,
          DEFAULT_LEGEND_OFFSET
        )}
        ref={innerRef}
        barGap={0}
        barCategoryGap={bars?.categoryGap}
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

        {barConfigs.map((barConfig, barIndex) => (
          <Bar
            key={barIndex}
            animationDuration={animation.duration}
            animationBegin={animation.begin}
            {...barConfig.props}
            onMouseOver={handleMouseOver(barIndex)}
            onMouseOut={handleMouseOut(barIndex)}
          >
            {(typeof labels === 'object' || labels === true) && (
              <LabelList {...labelConfig} />
            )}
            {typeof labels === 'function' && labels(labelConfig)}

            {barConfig.cells.map((cell, cellIndex) => (
              <Cell key={`cell-${barIndex}-${cellIndex}`} {...cell} />
            ))}
          </Bar>
        ))}

        <XAxis
          dataKey={layout === 'vertical' ? category : undefined}
          type={layout === 'vertical' ? 'category' : 'number'}
          stroke={legacyColors.chartLabel}
          fontSize={sizes.chartLabel}
          tick={{ transform: 'translate(0, 7)' }}
          {...xaxis}
        />
        <YAxis
          dataKey={layout === 'horizontal' ? category : undefined}
          type={layout === 'horizontal' ? 'category' : 'number'}
          stroke={legacyColors.chartLabel}
          fontSize={sizes.chartLabel}
          tickFormatter={tickFormatter}
          {...yaxis}
        />
      </RechartsBarChart>
    </Container>
  );
};

export default MultiBarChart;
