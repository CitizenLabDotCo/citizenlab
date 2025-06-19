import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import SearchInput from 'components/UI/SearchInput';

import { useIntl } from 'utils/cl-intl';

import UploadFileButtonWithModal from './components/UploadFileButtonWithModal';
import messages from './messages';

const ProjectFilesTab = () => {
  const { formatMessage } = useIntl();

  return (
    <Box mb="40px" p="44px">
      <Box display="flex" justifyContent="space-between">
        <SearchInput
          placeholder={formatMessage(messages.searchFiles)}
          onChange={() => {}} // TODO: Implement file search functionality.
          a11y_numberOfSearchResults={0}
        />
        <UploadFileButtonWithModal />
      </Box>
      <Box mt="40px" p="16px" background={colors.white}>
        TODO: Add file table component
      </Box>
    </Box>
  );
};

export default ProjectFilesTab;
