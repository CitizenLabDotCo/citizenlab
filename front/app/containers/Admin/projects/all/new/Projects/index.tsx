import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Filters from './Filters';
import Table from './Table';

const Projects = () => {
  return (
    <Box>
      <Filters />
      <Box mt="16px">
        <Table />
      </Box>
    </Box>
  );
};

export default Projects;
