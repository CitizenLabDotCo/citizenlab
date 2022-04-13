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
import { Mapping, BarProps, parseBarProps } from './utils';
import {
  Data,
  Layout,
  Margin,
  AxisProps,
  getRechartsLayout,
} from '../BarChart/utils';
import { isNilOrError } from 'utils/helperUtils';

interface RenderLabelsProps {
  fill: string;
  fontSize: number;
}

interface RenderTooltipProps {
  isAnimationActive: false;
  cursor: { fill: string };
}

interface Props {
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

        <Bar
          dataKey={length}
          animationDuration={animationDuration}
          animationBegin={animationBegin}
          {...parsedBarProps}
        >
          {renderLabels &&
            renderLabels({ fill: chartLabelColor, fontSize: chartLabelSize })}

          {fill &&
            data.map((row, index) => (
              <Cell
                key={`cell-${index}`}
                fill={row[fill] || parsedBarProps.fill}
              />
            ))}
        </Bar>

        <XAxis
          dataKey={layout === 'vertical' ? 'name' : length}
          type={layout === 'vertical' ? 'category' : 'number'}
          stroke={chartLabelColor}
          fontSize={chartLabelSize}
          tick={{ transform: 'translate(0, 7)' }}
          {...xaxis}
        />
        <YAxis
          dataKey={layout === 'horizontal' ? 'name' : length}
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
