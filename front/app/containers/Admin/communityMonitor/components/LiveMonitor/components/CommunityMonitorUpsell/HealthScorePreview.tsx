import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import HealthScore from './components/HealthScore';
import HealthScoreChart from './components/HealthScoreChart';
import Summary from './components/Summary';

const HealthScorePreview = () => {
  return (
    <Box>
      <Box display="flex">
        <Box zIndex={'2'}>
          <HealthScore />
        </Box>
        <Box ml="-52px" mt="16px">
          <HealthScoreChart />
        </Box>
      </Box>

      <Box mt="60px" ml="40px">
        <Summary />
      </Box>
    </Box>
  );
};

export default HealthScorePreview;
