import React from 'react';

// components
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Label,
} from 'recharts';
import EmptyState from '../_components/EmptyState';

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
  annotations,
  centerLabel,
  emptyContainerContent,
  innerRef,
}: Props<T>) => {
  if (hasNoData(data)) {
    return <EmptyState emptyContainerContent={emptyContainerContent} />;
  }

  const pieConfig = getPieConfig(data, mapping, pie, annotations);

  return (
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
  );
};

export default PieChart;
