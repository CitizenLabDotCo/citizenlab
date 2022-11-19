import React from 'react';

// components
import MultiBarChart from 'components/admin/Graphs/MultiBarChart';

// utils
import { convertMapping, convertBars } from './utils';

// typings
import { Props } from './typings';

const BarChart = <Row,>({
  mapping,
  bars,
  onMouseOver,
  onMouseOut,
  ...otherProps
}: Props<Row>) => {
  const convertedMapping = convertMapping(mapping);
  const convertedBars = convertBars(bars);

  const handleMouseOver = ({ row, rowIndex }, event: React.MouseEvent) => {
    onMouseOver && onMouseOver({ row, rowIndex }, event);
  };

  const handleMouseOut = ({ row, rowIndex }, event: React.MouseEvent) => {
    onMouseOut && onMouseOut({ row, rowIndex }, event);
  };

  return (
    <MultiBarChart
      mapping={convertedMapping}
      bars={convertedBars}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      {...otherProps}
    />
  );
};

export default BarChart;
