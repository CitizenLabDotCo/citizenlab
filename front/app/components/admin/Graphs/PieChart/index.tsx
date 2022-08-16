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
  emptyContainerContent,
  innerRef,
}: Props<T>) => {
  if (hasNoData(data)) {
    return <EmptyState emptyContainerContent={emptyContainerContent} />;
  }

  const pieConfig = getPieConfig(data, mapping, pie);

  return (
    <PieChartStyleFixesDiv>
      <ResponsiveContainer width={width} height={height}>
        <RechartsPieChart margin={margin} ref={innerRef}>
          <Pie data={data} {...pieConfig.props}>
            {pieConfig.cells.map((cell, cellIndex) => (
              <Cell key={`cell-${cellIndex}`} {...cell} />
            ))}
            <Label content={centerLabel} position="center" />
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </PieChartStyleFixesDiv>
  );
};

export default PieChart;
