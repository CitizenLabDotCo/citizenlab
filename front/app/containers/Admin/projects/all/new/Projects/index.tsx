import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Table from './Table';

const Projects = () => {
  return (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        p="16px"
        border={`1px solid #ccc`}
      >
        FILTERS
      </Box>
      <Box mt="16px">
        <Table />
      </Box>
    </Box>
  );
};

export default Projects;
