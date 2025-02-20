import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import ParticipationMethod from './ParticipationMethod';
import PopulationSize from './PopulationSize';
import Status from './Status';
import Topic from './Topic';
import Visibility from './Visibility';

const Filters = () => {
  return (
    <Box display="flex" flexDirection="row" gap="20px">
      <PopulationSize />
      <ParticipationMethod />
      <Topic />
      <Status />
      <Visibility />
    </Box>
  );
};

export default Filters;
