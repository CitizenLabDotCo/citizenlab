import React from 'react';

// components
// import { Box } from '@citizenlab/cl2-component-library';
import BarChart from 'components/admin/Graphs/BarChart';
import MultiBarChart from 'components/admin/Graphs/MultiBarChart';
import PieChart from 'components/admin/Graphs/PieChart';

type Row = {
  value: number;
  value2: number;
  label: string;
};

const data: Row[] = [
  { value: 3, value2: 4, label: 'apple' },
  { value: 2, value2: 3, label: 'banana' },
  { value: 5, value2: 6, label: 'coconut' },
];

const Playground = () => (
  <>
    <BarChart
      width={'100%'}
      height={400}
      data={data}
      mapping={{ length: 'value', category: 'label' }}
      labels
    />

    <MultiBarChart
      width="100%"
      height={400}
      data={data}
      mapping={{ length: ['value', 'value2'], category: 'label' }}
    />

    <PieChart
      height={200}
      data={data}
      mapping={{ angle: 'value', name: 'label' }}
      annotations
      tooltip
    />
  </>
);

export default Playground;
