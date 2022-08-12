import React from 'react';

// components
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Label,
  ResponsiveContainer,
} from 'recharts';
import { PieChartStyleFixesDiv } from 'components/admin/GraphWrappers';
import EmptyState from '../EmptyState';
import CustomLabel from './CustomLabel';

// utils
import { hasNoData } from '../utils';
import { getPieConfig } from './utils';

// typings
import { Props } from './typings';

const PieChart = <T,>({
  width,
  height,
  data,
  mapping,
  pie,
  margin,
  centerLabel,
  centerValue,
  emptyContainerContent,
}: Props<T>) => {
  if (hasNoData(data)) {
    return <EmptyState emptyContainerContent={emptyContainerContent} />;
  }

  const pieConfig = getPieConfig(data, mapping, pie);

  return (
    <PieChartStyleFixesDiv>
      <ResponsiveContainer width={width} height={height}>
        <RechartsPieChart margin={margin}>
          <Pie data={data} {...pieConfig.props}>
            {pieConfig.cells.map((cell, cellIndex) => (
              <Cell key={`cell-${cellIndex}`} {...cell} />
            ))}
            <Label
              content={<CustomLabel value={centerValue} label={centerLabel} />}
              position="center"
            />
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </PieChartStyleFixesDiv>
  );
};

export default PieChart;
