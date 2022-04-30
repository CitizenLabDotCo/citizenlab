import React from 'react';

// components
import MultiBarChart, {
  Props as MultiBarChartProps,
} from 'components/admin/Graphs/MultiBarChart';

// utils
import { convertMapping, convertBarProps, Mapping, BarProps } from './utils';

interface Props extends Omit<MultiBarChartProps, 'mapping' | 'bars'> {
  mapping?: Mapping;
  bars?: BarProps;
}

const BarChart = ({ mapping, bars, ...otherProps }: Props) => {
  const convertedMapping = convertMapping(mapping);
  const convertedBarProps = convertBarProps(bars);

  return (
    <MultiBarChart
      mapping={convertedMapping}
      bars={convertedBarProps}
      {...otherProps}
    />
  );
};

export default BarChart;
