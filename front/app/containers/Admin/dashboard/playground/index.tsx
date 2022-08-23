import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
// import BarChart from 'components/admin/Graphs/BarChart';
import MultiBarChart from 'components/admin/Graphs/MultiBarChart';
// import PieChart from 'components/admin/Graphs/PieChart';
// import ProgressBars from 'components/admin/Graphs/ProgressBars';

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

const legendItems: any = [
  { icon: 'rect', color: 'green', label: 'Apple' },
  { icon: 'line', color: 'blue', label: 'Blueberry' },
  { icon: 'circle', color: 'red', label: 'Cherry' },
];

const Playground = () => (
  <>
    <Box width="50%" height="400px">
      <MultiBarChart
        data={data}
        mapping={{
          length: ['value', 'value2'],
          category: 'label',
        }}
        legend={{
          items: [legendItems, legendItems.slice(0, 2)],
        }}
      />

      {/* <MultiBarChart
        height="100%"
        data={data}
        mapping={{
          length: ['value', 'value2'],
          category: 'label',
        }}
        tooltip
        labels
      /> */}

      {/* <ProgressBars
        height={200}
        data={data}
        mapping={{
          name: 'label',
          length: 'value',
          total: 'value2',
        }}
      /> */}
    </Box>
  </>
);

export default Playground;
