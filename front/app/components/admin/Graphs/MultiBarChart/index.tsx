import React from 'react';

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
} from 'recharts';
import EmptyState from '../_components/EmptyState';

// utils
import { getBarConfigs, getRechartsLayout } from './utils';
import { hasNoData } from '../utils';

// typings
import { Props } from './typings';

const MultiBarChart = <T,>({
  width,
  height,
  data,
  mapping,
  bars,
  layout = 'vertical',
  margin,
  xaxis,
  yaxis,
  renderLabels,
  renderTooltip,
  emptyContainerContent,
  innerRef,
}: Props<T>) => {
  if (hasNoData(data)) {
    return <EmptyState emptyContainerContent={emptyContainerContent} />;
  }

  const barConfigs = getBarConfigs(data, mapping, bars);
  const rechartsLayout = getRechartsLayout(layout);
  const labelPosition = layout === 'vertical' ? 'top' : 'right';
  const category = mapping.category as string;

  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsBarChart
        data={data}
        layout={rechartsLayout}
        margin={margin}
        ref={innerRef}
        barGap={0}
        barCategoryGap={bars?.categoryGap}
      >
        {renderTooltip &&
          renderTooltip({
            isAnimationActive: false,
            cursor: { fill: legacyColors.barHover },
          })}

        {barConfigs.map((barConfig, barIndex) => (
          <Bar
            key={barIndex}
            animationDuration={animation.duration}
            animationBegin={animation.begin}
            fill={legacyColors.barFill}
            {...barConfig.props}
          >
            {renderLabels &&
              renderLabels({
                fill: legacyColors.chartLabel,
                fontSize: sizes.chartLabel,
                position: labelPosition,
              })}

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
  );
};

export default MultiBarChart;
