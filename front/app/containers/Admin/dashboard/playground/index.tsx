import React from 'react';

// components
// import { Box } from '@citizenlab/cl2-component-library';
import PieChart from 'components/admin/Graphs/PieChart';
import BarChart from 'components/admin/Graphs/BarChart';

type Row = {
  value: number;
  label: string;
};

const data: Row[] = [
  { value: 3, label: 'apple' },
  { value: 2, label: 'banana' },
  { value: 5, label: 'coconut' },
];

const Playground = () => (
  <>
    <BarChart
      width={'100%'}
      height={200}
      data={data}
      mapping={{ length: 'value', category: 'label' }}
    />

    <PieChart data={data} mapping={{ angle: 'value', name: 'label' }} />
  </>
);

export default Playground;
