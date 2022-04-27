import React from 'react';

// hooks
import { useTheme } from 'styled-components';

// components
import { Box } from '@citizenlab/cl2-component-library';
import MultiBarChart from 'components/admin/Graphs/MultiBarChart';

type RepresentativenessData = {
  name: string;
  actualValue: number;
  referenceValue: number;
}[];

interface Props {
  data: RepresentativenessData;
}

const ChartCard = ({ data }: Props) => {
  const { newBarFill, secondaryNewBarFill }: any = useTheme();

  return (
    <Box width="100%" background="white">
      <MultiBarChart
        height={300}
        data={data}
        mapping={{ length: ['actualValue', 'referenceValue'] }}
        bars={{
          name: ['Platform users', 'Total population'],
          fill: [newBarFill, secondaryNewBarFill],
        }}
      />
    </Box>
  );
};

export default ChartCard;
