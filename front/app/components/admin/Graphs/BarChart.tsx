import React from 'react';

// components
import {
  ResponsiveContainer,
  BarChart as _BarChart,
  Bar,
  Tooltip as _Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';

// hooks
import { useTheme } from 'styled-components';

// utils
import {
  Data,
  Mapping,
  Layout,
  Margin,
  BarProps,
  parseMapping,
  getRechartsLayout,
  parseBarProps,
} from './barChartUtils';

interface Props {
  height?: string | number;
  data?: Data;
  mapping?: Mapping;
  layout?: Layout;
  margin?: Margin;
  bars?: BarProps;
  labels?: React.ReactNode;
  tooltip?: React.ReactNode;
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
  labels,
  tooltip,
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
        />
        <YAxis
          dataKey={layout === 'horizontal' ? 'name' : length}
          stroke={chartLabelColor}
          fontSize={chartLabelSize}
        />

        {tooltip}
      </_BarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;

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
