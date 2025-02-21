import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import ParticipationMethod from './ParticipationMethod';
import PopulationSize from './PopulationSize';
import Status from './Status';

const Filters = () => {
  return (
    <Box display="flex" flexDirection="row" gap="20px">
      <PopulationSize />
      <ParticipationMethod />
      <Status />
    </Box>
  );
};

export default Filters;
