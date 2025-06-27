import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import FilesTable from './components/FilesTable';

const ProjectFilesTab = () => {
  return (
    <Box mb="40px" p="44px">
      <Box>
        <FilesTable />
      </Box>
    </Box>
  );
};

export default ProjectFilesTab;
