import React from 'react';

// styling
import { animation } from '../styling';

// components
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Tooltip,
  Pie,
  Cell,
  Label,
} from 'recharts';
import EmptyState from '../_components/EmptyState';

// utils
import { getPieConfig } from './utils';
import { hasNoData, getTooltipConfig } from '../utils';

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
  tooltip,
  centerLabel,
  emptyContainerContent,
  innerRef,
  onMouseOver,
  onMouseOut,
}: Props<T>) => {
  if (hasNoData(data)) {
    return <EmptyState emptyContainerContent={emptyContainerContent} />;
  }

  const pieConfig = getPieConfig(data, mapping, pie, annotations);
  const tooltipConfig = getTooltipConfig(tooltip);

  const handleMouseOver = (_, rowIndex: number, event: React.MouseEvent) => {
    onMouseOver && onMouseOver({ row: data[rowIndex], rowIndex }, event);
  };

  const handleMouseOut = (_, rowIndex: number, event: React.MouseEvent) => {
    onMouseOut && onMouseOut({ row: data[rowIndex], rowIndex }, event);
  };

  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsPieChart margin={margin} ref={innerRef}>
        {(typeof tooltip === 'object' || tooltip === true) && (
          <Tooltip {...tooltipConfig} />
        )}
        {typeof tooltip === 'function' && tooltip(tooltipConfig)}

        <Pie
          data={data}
          animationDuration={animation.duration}
          animationBegin={animation.begin}
          {...pieConfig.props}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
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
