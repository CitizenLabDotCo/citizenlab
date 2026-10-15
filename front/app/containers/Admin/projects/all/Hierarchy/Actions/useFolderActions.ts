import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import { MenuEntry } from '../Menu/FlyoutMenu';
import messages from '../messages';

interface Params {
  folderId: string;
  folderSpaceId: string | null;
}

// What can be done on a folder wherever its "⋯" is, its tile, its row or its
// level, for those who manage it.
const useFolderActions = ({ folderId, folderSpaceId }: Params) => {
  const { formatMessage } = useIntl();
  const canModerate = usePermission({
    item: 'project_folder',
    action: 'moderate',
    context: { folderId, folderSpaceId },
  });

  const entries: MenuEntry[] = canModerate
    ? [
        {
          key: 'edit',
          icon: 'edit',
          label: formatMessage(messages.editFolder),
          link: {
            to: '/admin/projects/folders/$projectFolderId/settings',
            params: { projectFolderId: folderId },
          },
        },
      ]
    : [];

  return { canModerate, entries };
};

export default useFolderActions;
