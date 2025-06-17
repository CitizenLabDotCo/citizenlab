import React from 'react';

import {
  Box,
  Button,
  colors,
  SearchInput,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const ProjectFilesTab = () => {
  const { formatMessage } = useIntl();

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
        <Button
          buttonStyle="admin-dark"
          icon="plus-circle"
          iconSize="24px"
          data-cy="e2e-admin-projects-project-files-add-button"
          text={formatMessage(messages.addFile)}
          onClick={() => {}}
        />
      </Box>
      <Box mt="40px" p="16px" background={colors.white}>
        Table Here
      </Box>
    </Box>
  );
};

export default ProjectFilesTab;
