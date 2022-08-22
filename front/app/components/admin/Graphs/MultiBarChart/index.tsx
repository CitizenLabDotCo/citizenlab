import React, { useState } from 'react';

// styling
import {
  legacyColors,
  sizes,
  animation,
} from 'components/admin/Graphs/styling';

// components
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  LabelList,
  Tooltip,
} from 'recharts';
import EmptyState from '../_components/EmptyState';
import Legend from '../_components/Legend';
import FakeLegend from '../_components/Legend/FakeLegend';

// utils
import { getBarConfigs, getRechartsLayout, getLabelConfig } from './utils';
import { hasNoData, getTooltipConfig } from '../utils';

// typings
import { Props } from './typings';
import { LegendItemsDimensions, GraphDimensions } from '../_components/Legend/typings';

const ITEMS: any = [
  { icon: 'rect', color: 'green', label: 'Apple' },
  { icon: 'line', color: 'blue', label: 'Blueberry' },
  { icon: 'plain-line', color: 'red', label: 'Cherry' }
]

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
}: Props<Row>) => {
  const [graphDimensions, setGraphDimensions] = useState<GraphDimensions | undefined>();
  const [legendItemsDimensions, setLegendItemsDimensions] = useState<LegendItemsDimensions | undefined>();

  if (hasNoData(data)) {
    return <EmptyState emptyContainerContent={emptyContainerContent} />;
  }

  const barConfigs = getBarConfigs(data, mapping, bars);
  const rechartsLayout = getRechartsLayout(layout);
  const category = mapping.category as string;

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

  const handleRef = (ref: any) => {
    if (graphDimensions) return;
    if (ref === null) return;

    const node = ref.current;

    setGraphDimensions({
      graphWidth: node.clientWidth,
      graphHeight: node.clientHeight
    });
  };

  console.log(graphDimensions)

  return (
    <>
      <ResponsiveContainer width={width} height={height} ref={handleRef}>
        <RechartsBarChart
          data={data}
          layout={rechartsLayout}
          margin={{ ...margin, bottom: 30 }}
          ref={innerRef}
          barGap={0}
          barCategoryGap={bars?.categoryGap}
        >
          {graphDimensions && legendItemsDimensions && (
            <g>
              <Legend
                {...graphDimensions}
                items={ITEMS}
                legendItemsDimensions={legendItemsDimensions}
                position="bottom-center"
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
            {...yaxis}
          />
        </RechartsBarChart>
      </ResponsiveContainer>

      {legend && (
        <FakeLegend
          items={ITEMS}
          onCalculateDimensions={setLegendItemsDimensions}
        />
      )}
    </>
  );
};

export default MultiBarChart;
