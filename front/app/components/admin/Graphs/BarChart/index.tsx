import React from 'react';

// components
import MultiBarChart from 'components/admin/Graphs/MultiBarChart';

// utils
import { convertMapping, convertBars } from './utils';

// typings
import { Props } from './typings';

const BarChart = <T,>({ mapping, bars, ...otherProps }: Props<T>) => {
  const convertedMapping = convertMapping(mapping);
  const convertedBars = convertBars(bars);

  return (
    <MultiBarChart
      mapping={convertedMapping}
      bars={convertedBars}
      {...otherProps}
    />
  );
};

export default BarChart;
