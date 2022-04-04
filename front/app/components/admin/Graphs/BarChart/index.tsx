import React from 'react';
import { isEmpty } from 'lodash-es';

// components
import {
  ResponsiveContainer,
  BarChart as _BarChart,
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
  Data,
  Mapping,
  Layout,
  Margin,
  BarProps,
  AxisProps,
  parseMapping,
  getRechartsLayout,
  parseBarProps,
} from './utils';

interface RenderLabelsProps {
  fill: string;
  fontSize: number;
}

interface RenderTooltipProps {
  isAnimationActive: false;
  cursor: { fill: string };
}

interface Props {
  height?: string | number;
  data?: Data | null;
  mapping?: Mapping;
  layout?: Layout;
  margin?: Margin;
  bars?: BarProps;
  xaxis?: AxisProps;
  yaxis?: AxisProps;
  renderLabels?: (props: RenderLabelsProps) => React.ReactNode;
  renderTooltip?: (props: RenderTooltipProps) => React.ReactNode;
  emptyContainerContent?: React.ReactNode;
  className?: string;
  innerRef?: any;
}

const BarChart = ({
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

  const noData = !data || data.every(isEmpty) || data.length <= 0;

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

  const { length, fill } = parseMapping(mapping);
  const rechartsLayout = getRechartsLayout(layout);
  const parsedBarProps = parseBarProps(newBarFill, bars);

  return (
    <ResponsiveContainer className={className} height={height}>
      <_BarChart
        data={data}
        layout={rechartsLayout}
        margin={margin}
        ref={innerRef}
      >
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
          stroke={chartLabelColor}
          fontSize={chartLabelSize}
          tick={{ transform: 'translate(0, 7)' }}
          {...xaxis}
        />
        <YAxis
          dataKey={layout === 'horizontal' ? 'name' : length}
          stroke={chartLabelColor}
          fontSize={chartLabelSize}
          {...yaxis}
        />

        {renderTooltip &&
          renderTooltip({
            isAnimationActive: false,
            cursor: { fill: barHoverColor },
          })}
      </_BarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;
