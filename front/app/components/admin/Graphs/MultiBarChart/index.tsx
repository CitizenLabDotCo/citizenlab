import React from 'react';
import { isEmpty } from 'lodash-es';

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
import {
  parseBarProps,
  getRechartsLayout,
  applyChannel,
} from './utils';
import { isNilOrError } from 'utils/helperUtils';

// typings
import { Props } from './typings';

const MultiBarChart = ({
  width,
  height,
  data,
  mapping,
  layout = 'vertical',
  margin,
  bars,
  xaxis,
  yaxis,
  renderLabels,
  renderTooltip,
  emptyContainerContent,
  className,
  innerRef,
}: Props) => {
  const noData = isNilOrError(data) || data.every(isEmpty) || data.length <= 0;

  if (noData) {
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

  const { length, fill, opacity } = mapping;
  const rechartsLayout = getRechartsLayout(layout);
  const parsedBarProps = parseBarProps(colors.barFill, length.length, bars);

  const labelPosition = layout === 'vertical' ? 'top' : 'right';

  return (
    <ResponsiveContainer className={className} width={width} height={height}>
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
            cursor: { fill: colors.barHover },
          })}

        {parsedBarProps.map((parallelBarProps, index) => (
          <Bar
            dataKey={length[index]}
            animationDuration={animation.duration}
            animationBegin={animation.begin}
            {...parallelBarProps}
            key={index}
          >
            {renderLabels &&
              renderLabels({
                fill: colors.chartLabel,
                fontSize: sizes.chartLabel,
                position: labelPosition,
              })}

            {(fill || opacity) &&
              data.map((row, fillIndex) => (
                <Cell
                  key={`cell-${index}-${fillIndex}`}
                  fill={applyChannel(row, index, fill) || parallelBarProps.fill}
                  opacity={applyChannel(row, index, opacity) || 1}
                />
              ))}
          </Bar>
        ))}

        <XAxis
          dataKey={layout === 'vertical' ? 'name' : undefined}
          type={layout === 'vertical' ? 'category' : 'number'}
          stroke={colors.chartLabel}
          fontSize={sizes.chartLabel}
          tick={{ transform: 'translate(0, 7)' }}
          {...xaxis}
        />
        <YAxis
          dataKey={layout === 'horizontal' ? 'name' : undefined}
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
