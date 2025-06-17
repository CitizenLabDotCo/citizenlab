import React from 'react';

import { Box, colors, SearchInput } from '@citizenlab/cl2-component-library';

import UploadFileButton from './components/UploadFile';

const ProjectFilesTab = () => {
  return (
    <Box mb="40px" p="44px">
      <Box display="flex" justifyContent="space-between">
        <SearchInput
          placeholder="Search files"
          data-cy="e2e-admin-projects-project-files-search-input"
          onChange={() => {}}
          id={''}
          ariaLabel={''}
          a11y_closeIconTitle={''}
        />
        <UploadFileButton />
      </Box>
      <Box mt="40px" p="16px" background={colors.white}>
        Table Here
      </Box>
    </Box>
  );
};

export default ProjectFilesTab;
