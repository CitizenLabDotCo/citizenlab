import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { UserComponent } from '@craftjs/core';

import useProjectFolderFiles from 'api/project_folder_files/useProjectFolderFiles';

import FileAttachments from 'components/UI/FileAttachments';

import messages from './messages';

interface Props {
  folderId: string;
}
const FolderFiles: UserComponent = ({ folderId }: Props) => {
  const { data: projectFolderFiles } = useProjectFolderFiles({
    projectFolderId: folderId,
  });

  if (!projectFolderFiles || projectFolderFiles.data.length === 0) {
    return null;
  }

  return (
    <Box>
      <FileAttachments files={projectFolderFiles.data} />
    </Box>
  );
};

FolderFiles.craft = {
  custom: {
    title: messages.folderFiles,
  },
};

export const folderFilesTitle = messages.folderFiles;

export default FolderFiles;
