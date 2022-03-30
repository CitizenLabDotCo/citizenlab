import React from 'react';

// components
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// hooks
import { useTheme } from 'styled-components';

interface Props {
  height?: string | number;
  data: any[];
  className?: string;
}

const _BarChart = ({ height, data, className }: Props) => {
  const {
    chartLabelSize,
    chartLabelColor,
    barHoverColor,
    animationBegin,
    animationDuration,
    newBarFill,
  }: any = useTheme;

  return (
    <ResponsiveContainer className={className} height={height}>
      <BarChart data={data} ref={this.currentChart}>
        <Bar
          dataKey="value"
          name={graphTitle}
          fill={newBarFill}
          animationDuration={animationDuration}
          animationBegin={animationBegin}
          isAnimationActive={true}
        />
        <XAxis
          dataKey="name"
          stroke={chartLabelColor}
          fontSize={chartLabelSize}
          tick={{ transform: 'translate(0, 7)' }}
          tickFormatter={this.formatTick}
        />
        <YAxis stroke={chartLabelColor} fontSize={chartLabelSize} />
        <Tooltip
          isAnimationActive={false}
          labelFormatter={this.formatLabel}
          cursor={{ fill: barHoverColor }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default _BarChart;
