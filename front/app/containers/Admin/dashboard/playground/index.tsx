import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import BarChart from 'components/admin/Graphs/BarChart';
// import MultiBarChart from 'components/admin/Graphs/MultiBarChart';
// import PieChart from 'components/admin/Graphs/PieChart';
// import ProgressBars from 'components/admin/Graphs/ProgressBars';
import FakeLegend from 'components/admin/Graphs/_components/Legend/FakeLegend';
import Legend from 'components/admin/Graphs/_components/Legend';

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

const fakeLegendItems: any = [
  { icon: 'rect', fill: 'green', label: 'Apple' },
  { icon: 'rect', fill: 'yellow', label: 'Banana' },
  { icon: 'rect', fill: 'red', label: 'Cherry' }
]

const legendItemsSummary = {
  legendWidth: 233,
  legendHeight: 20,
  itemSizes: [
    {
      "left": 0,
      "width": 72,
      "height": 20
    },
    {
      "left": 72,
      "width": 83,
      "height": 20
    },
    {
      "left": 155,
      "width": 78,
      "height": 20
    }
  ]
}

const Playground = () => (
  <>
    <Box width="50%" height="400px">
      <BarChart
        data={data}
        mapping={{
          length: 'value',
          category: 'label',
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

      <FakeLegend items={fakeLegendItems} show onCalculateDimensions={console.log} />
      <svg width="800px" height="100px" style={{ backgroundColor: 'pink' }}>
        <Legend 
          items={fakeLegendItems}
          legendItemsSummary={legendItemsSummary}
          parentWidth={800}
          parentHeight={100}
          position="bottom-left"
        />
      </svg>
    </Box>
  </>
);

export default Playground;
