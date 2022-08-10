import React from 'react';

// styling
import { colors, sizes, animation } from 'components/admin/Graphs/styling';

// components
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import { NoDataContainer } from 'components/admin/GraphWrappers';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { getBars, getRechartsLayout } from './utils';
import { hasNoData } from '../utils';

// typings
import { Props } from './typings';

const MultiBarChart = <T,>({
  width,
  height,
  data,
  mapping,
  barSettings,
  layout = 'vertical',
  margin,
  xaxis,
  yaxis,
  renderLabels,
  renderTooltip,
  emptyContainerContent,
  className,
  innerRef,
}: Props<T>) => {
  if (hasNoData(data)) {
    return (
      <NoDataContainer>
        {emptyContainerContent ? (
          <>{emptyContainerContent}</>
        ) : (
          <FormattedMessage {...messages.noData} />
        )}
      </NoDataContainer>
    );
  }

  const bars = getBars(data, mapping, barSettings);
  const rechartsLayout = getRechartsLayout(layout);
  const labelPosition = layout === 'vertical' ? 'top' : 'right';
  const category = mapping.category as string;

  return (
    <ResponsiveContainer className={className} width={width} height={height}>
      <RechartsBarChart
        data={data}
        layout={rechartsLayout}
        margin={margin}
        ref={innerRef}
        barGap={0}
        barCategoryGap={barSettings?.gap}
      >
        {renderTooltip &&
          renderTooltip({
            isAnimationActive: false,
            cursor: { fill: colors.barHover },
          })}

        {bars.map((bar, barIndex) => (
          <Bar
            key={barIndex}
            animationDuration={animation.duration}
            animationBegin={animation.begin}
            {...bar}
          >
            {renderLabels &&
              renderLabels({
                fill: colors.chartLabel,
                fontSize: sizes.chartLabel,
                position: labelPosition,
              })}

            {bar.cells &&
              bar.cells.map((cell, cellIndex) => (
                <Cell key={`cell-${barIndex}-${cellIndex}`} {...cell} />
              ))}
          </Bar>
        ))}

        <XAxis
          dataKey={layout === 'vertical' ? category : undefined}
          type={layout === 'vertical' ? 'category' : 'number'}
          stroke={colors.chartLabel}
          fontSize={sizes.chartLabel}
          tick={{ transform: 'translate(0, 7)' }}
          {...xaxis}
        />
        <YAxis
          dataKey={layout === 'horizontal' ? category : undefined}
          type={layout === 'horizontal' ? 'category' : 'number'}
          stroke={colors.chartLabel}
          fontSize={sizes.chartLabel}
          {...yaxis}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default MultiBarChart;
