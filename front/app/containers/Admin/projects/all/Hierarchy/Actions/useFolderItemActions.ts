import { MiniProjectFolder } from 'api/project_folders_mini/types';

import { ArrangePlace } from '../Arrange/arrangeTargets';

import useFolderActions from './useFolderActions';

// A folder's actions from its tile or row, the places it can be arranged and
// moved from.
const useFolderItemActions = (
  folder: MiniProjectFolder,
  place?: ArrangePlace
) =>
  useFolderActions({
    folderId: folder.id,
    folderSpaceId: folder.attributes.space_id,
    arrange: place && {
      place,
      adminPublicationId: folder.attributes.admin_publication_id,
    },
    movable: true,
  });

export default useFolderItemActions;
