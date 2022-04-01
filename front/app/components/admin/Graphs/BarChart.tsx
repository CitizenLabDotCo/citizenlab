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
  Tooltip as _Tooltip,
  LabelList as _LabelList,
  LabelProps,
} from 'recharts';
import { NoDataContainer } from 'components/admin/GraphWrappers';

// hooks
import { useTheme } from 'styled-components';

// i18n
import messages from './messages';
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
} from './barChartUtils';

interface Props {
  height?: string | number;
  data?: Data | null;
  mapping?: Mapping;
  layout?: Layout;
  margin?: Margin;
  bars?: BarProps;
  xaxis?: AxisProps;
  yaxis?: AxisProps;
  labels?: React.ReactNode;
  tooltip?: React.ReactNode;
  emptyContainerContent?: React.ReactNode;
  className?: string;
  ref?: any;
}

const BarChart = ({
  height,
  data,
  mapping,
  layout,
  margin,
  bars,
  xaxis,
  yaxis,
  labels,
  tooltip,
  emptyContainerContent,
  className,
  ref,
}: Props) => {
  const {
    chartLabelSize,
    chartLabelColor,
    animationBegin,
    animationDuration,
    newBarFill,
  }: any = useTheme();

  const noData = !data || data.every(isEmpty) || data.length <= 0;

  if (noData) {
    return (
      <NoDataContainer>
        {emptyContainerContent ? (
          { emptyContainerContent }
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
      <_BarChart data={data} layout={rechartsLayout} margin={margin} ref={ref}>
        <Bar
          dataKey={length}
          animationDuration={animationDuration}
          animationBegin={animationBegin}
          {...parsedBarProps}
        >
          {labels}

          {fill &&
            data &&
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

        {tooltip}
      </_BarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;

export const LabelList = (props: Omit<LabelProps, 'viewBox'>) => {
  const { chartLabelSize, chartLabelColor }: any = useTheme();

  return (
    <_LabelList fill={chartLabelColor} fontSize={chartLabelSize} {...props} />
  );
};

interface TooltipProps {
  labelFormatter?: (label: any) => React.ReactNode;
}

export const Tooltip = (props: TooltipProps) => {
  const { barHoverColor }: any = useTheme();

  return (
    <_Tooltip
      isAnimationActive={false}
      cursor={{ fill: barHoverColor }}
      {...props}
    />
  );
};
