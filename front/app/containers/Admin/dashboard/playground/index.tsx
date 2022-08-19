import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import BarChart from 'components/admin/Graphs/BarChart';
import MultiBarChart from 'components/admin/Graphs/MultiBarChart';
// import PieChart from 'components/admin/Graphs/PieChart';
import ProgressBars from 'components/admin/Graphs/ProgressBars';

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
    <Box width="50%" height="400px">
      <BarChart
        height="100%"
        data={data}
        mapping={{
          length: 'value',
          category: 'label',
        }}
      />

      <MultiBarChart
        height="100%"
        data={data}
        mapping={{
          length: ['value', 'value2'],
          category: 'label',
        }}
        tooltip
        labels
      />

      <ProgressBars
        data={data}
        mapping={{
          name: 'label',
          length: 'value',
          total: 'value2',
        }}
      />
    </Box>
  </>
);

export default Playground;
