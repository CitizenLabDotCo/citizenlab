import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import FilterBar from '../_shared/FilterBar';

import Table from './Table';

const Projects = () => {
  return (
    <Box>
      <FilterBar />
      <Box mt="16px">
        <Table />
      </Box>
    </Box>
  );
};

export default Projects;
