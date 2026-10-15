import React from 'react';

import { MiniProjectFolder } from 'api/project_folders_mini/types';

import { ArrangePlace } from '../Arrange/arrangeTargets';
import MoreActions from '../Menu/MoreActions';

import useFolderActions from './useFolderActions';

interface Props {
  folder: MiniProjectFolder;
  place?: ArrangePlace;
}

// A folder's "⋯" on its tile or row.
const FolderActions = ({ folder, place }: Props) => {
  const { entries } = useFolderActions({
    folderId: folder.id,
    folderSpaceId: folder.attributes.space_id,
    arrange: place && {
      place,
      adminPublicationId: folder.attributes.admin_publication_id,
    },
    movable: true,
  });
  return <MoreActions entries={entries} />;
};

export default FolderActions;
