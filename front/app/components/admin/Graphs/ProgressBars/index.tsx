import React from 'react';

// styling
import { colors } from '../styling';

// components
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
  Tooltip,
} from 'recharts';
import { OneSideRoundedBar, CustomizedLabel } from './components';
import EmptyState from '../_components/EmptyState';

// utils
import { hasNoData, getTooltipConfig } from '../utils';

// typings
import { Props } from './typings';

const ProgressBars = <Row,>({
  data,
  width,
  height,
  tooltip,
  emptyContainerContent,
}: Props<Row>) => {
  if (hasNoData(data)) {
    return <EmptyState emptyContainerContent={emptyContainerContent} />;
  }

  const tooltipConfig = getTooltipConfig(tooltip);

  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart
        data={data}
        layout="vertical"
        stackOffset="expand"
        barSize={8}
        margin={{ bottom: 0 }}
      >
        {(typeof tooltip === 'object' || tooltip === true) && (
          <Tooltip {...tooltipConfig} />
        )}
        {typeof tooltip === 'function' && tooltip(tooltipConfig)}

        <XAxis hide type="number" />
        <YAxis width={0} type="category" dataKey="name" />
        <Bar
          dataKey="value"
          stackId="a"
          fill={colors.blue}
          isAnimationActive={false}
          shape={(props) => <OneSideRoundedBar {...props} side="left" />}
        >
          <LabelList dataKey="label" data={data} content={CustomizedLabel} />
        </Bar>
        <Bar
          dataKey="total"
          stackId="a"
          fill={colors.lightGrey}
          isAnimationActive={false}
          shape={(props) => <OneSideRoundedBar {...props} side="right" />}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ProgressBars;
