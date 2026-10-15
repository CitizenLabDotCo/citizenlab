import React from 'react';

import { MiniProjectFolder } from 'api/project_folders_mini/types';

import MoreActions from '../Menu/MoreActions';

import useFolderActions from './useFolderActions';

interface Props {
  folder: MiniProjectFolder;
}

// A folder's "⋯" on its tile or row.
const FolderActions = ({ folder }: Props) => {
  const { entries } = useFolderActions({
    folderId: folder.id,
    folderSpaceId: folder.attributes.space_id,
  });
  return <MoreActions entries={entries} />;
};

export default FolderActions;
