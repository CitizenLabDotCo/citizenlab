import React from 'react';

import { Box, colors, SearchInput } from '@citizenlab/cl2-component-library';

import UploadFileButton from './components/UploadFile';

const ProjectFilesTab = () => {
  return (
    <Box mb="40px" p="44px">
      <Box display="flex" justifyContent="space-between">
        <SearchInput
          placeholder="Search files"
          onChange={() => {}}
          id={''}
          ariaLabel={''}
          a11y_closeIconTitle={''}
        />
        <UploadFileButton />
      </Box>
      <Box mt="40px" p="16px" background={colors.white}>
        TODO: Add file table component
      </Box>
    </Box>
  );
};

export default ProjectFilesTab;
