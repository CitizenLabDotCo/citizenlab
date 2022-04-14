import React from 'react';

// components
import MultiBarChart, {
  Props as MultiBarChartProps,
} from 'components/admin/Graphs/MultiBarChart';

// utils
import { convertMapping, convertBarProps, Mapping, BarProps } from './utils';

// typings
import { Margin } from 'components/admin/Graphs/MultiBarChart/utils';

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

export const DEFAULT_MARGIN: Margin = {
  top: 20,
  right: 30,
  left: 10,
  bottom: 5,
};
