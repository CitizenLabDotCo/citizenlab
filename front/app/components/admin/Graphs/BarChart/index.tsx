import React from 'react';

import MultiBarChart from 'components/admin/Graphs/MultiBarChart';

import { AccessibilityProps } from '../typings';

import { Props } from './typings';
import { convertMapping, convertBars } from './utils';

const BarChart = <Row,>({
  mapping,
  bars,
  onMouseOver,
  onMouseOut,
  ariaLabel,
  ariaDescribedBy,
  ...otherProps
}: Props<Row> & AccessibilityProps) => {
  const convertedMapping = convertMapping(mapping);
  const convertedBars = convertBars(bars);

  const handleMouseOver = ({ row, rowIndex }, event: React.MouseEvent) => {
    onMouseOver && onMouseOver({ row, rowIndex }, event);
  };

  const handleMouseOut = ({ row, rowIndex }, event: React.MouseEvent) => {
    onMouseOut && onMouseOut({ row, rowIndex }, event);
  };
  const accessibilityProps = {
    ariaLabel,
    ariaDescribedBy,
  };

  return (
    <MultiBarChart
      mapping={convertedMapping}
      bars={convertedBars}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      {...otherProps}
      {...accessibilityProps}
    />
  );
};

export default BarChart;
