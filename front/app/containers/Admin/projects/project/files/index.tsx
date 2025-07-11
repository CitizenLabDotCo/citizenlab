import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import FilesList from './components/FilesList';

const ProjectFilesTab = () => {
  return (
    <Box mb="40px" p="44px">
      <Box>
        <FilesList />
      </Box>
    </Box>
  );
};

export default ProjectFilesTab;
