import React, { RefObject } from 'react';
import { isEmpty } from 'lodash-es';

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

// hooks
import { useTheme } from 'styled-components';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import {
  parseBarProps,
  BarProps,
  getRechartsLayout,
  Mapping,
  Data,
  Layout,
  AxisProps,
} from './utils';
import { isNilOrError } from 'utils/helperUtils';

// typings
import { Margin } from 'components/admin/Graphs/constants';

interface RenderLabelsProps {
  fill: string;
  fontSize: number;
  position: 'top' | 'right';
}

interface RenderTooltipProps {
  isAnimationActive: false;
  cursor: { fill: string };
}

export interface Props {
  width?: string | number;
  height?: string | number;
  data?: Data | null | Error;
  mapping: Mapping;
  layout?: Layout;
  margin?: Margin;
  bars?: BarProps;
  xaxis?: AxisProps;
  yaxis?: AxisProps;
  renderLabels?: (props: RenderLabelsProps) => React.ReactNode;
  renderTooltip?: (props: RenderTooltipProps) => React.ReactNode;
  emptyContainerContent?: React.ReactNode;
  className?: string;
  innerRef?: RefObject<any>;
}

const BarChart = ({
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
  const {
    chartLabelSize,
    chartLabelColor,
    animationBegin,
    animationDuration,
    newBarFill,
    barHoverColor,
  }: any = useTheme();

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

  const { length, fill } = mapping;
  const rechartsLayout = getRechartsLayout(layout);
  const parsedBarProps = parseBarProps(newBarFill, length.length, bars);

  const labelPosition: 'top' | 'right' =
    layout === 'vertical' ? 'top' : 'right';

  return (
    <ResponsiveContainer className={className} width={width} height={height}>
      <RechartsBarChart
        data={data}
        layout={rechartsLayout}
        margin={margin}
        ref={innerRef}
      >
        {renderTooltip &&
          renderTooltip({
            isAnimationActive: false,
            cursor: { fill: barHoverColor },
          })}

        {parsedBarProps.map((categoryProps, index) => (
          <Bar
            dataKey={length[index]}
            animationDuration={animationDuration}
            animationBegin={animationBegin}
            {...categoryProps}
            key={index}
          >
            {renderLabels &&
              renderLabels({
                fill: chartLabelColor,
                fontSize: chartLabelSize,
                position: labelPosition,
              })}

            {fill &&
              data.map((row, fillIndex) => (
                <Cell
                  key={`cell-${index}-${fillIndex}`}
                  fill={row[fill[index]] || categoryProps.fill}
                />
              ))}
          </Bar>
        ))}

        <XAxis
          dataKey={layout === 'vertical' ? 'name' : undefined}
          type={layout === 'vertical' ? 'category' : 'number'}
          stroke={chartLabelColor}
          fontSize={chartLabelSize}
          tick={{ transform: 'translate(0, 7)' }}
          {...xaxis}
        />
        <YAxis
          dataKey={layout === 'horizontal' ? 'name' : undefined}
          type={layout === 'horizontal' ? 'category' : 'number'}
          stroke={chartLabelColor}
          fontSize={chartLabelSize}
          {...yaxis}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;
