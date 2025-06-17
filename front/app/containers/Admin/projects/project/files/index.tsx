import React from 'react';

import { Box, colors, SearchInput } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import UploadFileModal from './components/UploadFile';
import messages from './messages';

const ProjectFilesTab = () => {
  const { formatMessage } = useIntl();

  return (
    <Box mb="40px" p="44px">
      <Box display="flex" justifyContent="space-between">
        <SearchInput
          placeholder={formatMessage(messages.searchFiles)}
          onChange={() => {}} // TODO: Implement file search functionality.
          id={'search-files-data-repository'}
          ariaLabel={''}
          a11y_closeIconTitle={''}
        />
        <UploadFileModal />
      </Box>
      <Box mt="40px" p="16px" background={colors.white}>
        TODO: Add file table component
      </Box>
    </Box>
  );
};

export default ProjectFilesTab;
