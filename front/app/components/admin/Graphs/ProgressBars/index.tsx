import React from 'react';

// components
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  LabelList,
  Tooltip,
} from 'recharts';
import { OneSideRoundedBar, CustomizedLabel } from './components';
import EmptyState from '../_components/EmptyState';

// utils
import { hasNoData, getTooltipConfig } from '../utils';
import { getBarConfigs } from './utils';

// typings
import { Props } from './typings';

const ProgressBars = <Row,>({
  data,
  width,
  height,
  mapping,
  bars,
  margin,
  tooltip,
  emptyContainerContent,
}: Props<Row>) => {
  if (hasNoData(data)) {
    return <EmptyState emptyContainerContent={emptyContainerContent} />;
  }

  const tooltipConfig = getTooltipConfig(tooltip);
  const { progressBarConfig, totalBarConfig } = getBarConfigs(
    data,
    mapping,
    bars
  );

  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart
        data={data}
        layout="vertical"
        stackOffset="expand"
        barSize={12}
        margin={margin}
      >
        {(typeof tooltip === 'object' || tooltip === true) && (
          <Tooltip {...tooltipConfig} />
        )}
        {typeof tooltip === 'function' && tooltip(tooltipConfig)}

        <XAxis hide type="number" />
        <YAxis width={0} type="category" dataKey={mapping.name as string} />
        <Bar
          {...progressBarConfig.props}
          stackId="a"
          shape={(props) => <OneSideRoundedBar {...props} side="left" />}
        >
          <LabelList
            dataKey={mapping.name as string}
            data={data}
            content={(props) => <CustomizedLabel {...props} />}
          />

          {progressBarConfig.cells.map((cell, cellIndex) => (
            <Cell key={`cell-${cellIndex}`} {...cell} />
          ))}
        </Bar>
        <Bar
          {...totalBarConfig.props}
          stackId="a"
          shape={(props) => <OneSideRoundedBar {...props} side="right" />}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ProgressBars;
