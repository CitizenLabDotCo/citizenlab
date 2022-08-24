import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
// import BarChart from 'components/admin/Graphs/BarChart';
import MultiBarChart from 'components/admin/Graphs/MultiBarChart';
import StackedBarChart from 'components/admin/Graphs/StackedBarChart';
// import PieChart from 'components/admin/Graphs/PieChart';
// import ProgressBars from 'components/admin/Graphs/ProgressBars';
import { LabelList } from 'recharts';

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

const colors = ['red', 'blue', 'green'];

const radii = {
  0: [5, 0, 0, 5],
  1: 0,
  2: [0, 5, 5, 0],
};

const percentages = [0.3, 0.4, 0.3];
const cumulativeValues = [3, 7, 10];

const valueAccessor = (payload) => {
  const i = cumulativeValues.indexOf(payload.value[1]);
  return `${percentages[i] * 100}%`;
};

const centerLabels = () => (
  <LabelList position="center" valueAccessor={valueAccessor} fill="white" />
);

const Playground = () => (
  <>
    <Box width="50%" height="400px">
      <MultiBarChart
        data={data}
        mapping={{
          length: ['value', 'value2'],
          category: 'label',
          fill: ({ barIndex }) => (barIndex === 0 ? 'blue' : 'red'),
        }}
        legend={{
          position: 'bottom-center',
          items: [legendItems, legendItems.slice(0, 2)],
        }}
      />
    </Box>

    <Box width="50%" height="100px" mt="30px">
      <StackedBarChart
        data={data.slice(0, 1)}
        mapping={{
          stackedLength: ['value', 'value2', 'value'],
          category: 'label',
          fill: ({ stackIndex }) => colors[stackIndex],
          cornerRadius: ({ stackIndex }) => radii[stackIndex],
        }}
        layout="horizontal"
        labels={centerLabels}
        xaxis={{ hide: true, domain: [0, 'dataMax'] }}
        yaxis={{ hide: true }}
        legend={{
          position: 'bottom-center',
          items: [legendItems, legendItems.slice(0, 2)],
        }}
      />
    </Box>
  </>
);

export default Playground;
