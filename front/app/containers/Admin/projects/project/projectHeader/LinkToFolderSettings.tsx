import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import LinkToFolderProjectsDropdown from './LinkToFolderProjectsDropdown';

interface Props {
  folderId: string;
  projectId: string;
}

export const fragmentId = 'folder';
const LinkToFolderSettings = ({ folderId, projectId }: Props) => {
  return (
    <Box position="relative">
      <Box display="flex">
        <LinkToFolderProjectsDropdown
          projectId={projectId}
          folderId={folderId}
        />
      </Box>
    </Box>
  );
};

export default LinkToFolderSettings;
