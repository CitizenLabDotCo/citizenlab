import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import { MenuEntry } from '../Menu/FlyoutMenu';
import messages from '../messages';

// What can be done on a space wherever its "⋯" is, its tile, its row or its
// level, for those who manage it.
const useSpaceActions = (spaceId: string) => {
  const { formatMessage } = useIntl();
  const canManage = usePermission({
    item: 'space',
    action: 'manage_projects_and_folders',
    context: { spaceId },
  });

  const entries: MenuEntry[] = canManage
    ? [
        {
          key: 'edit',
          icon: 'edit',
          label: formatMessage(messages.editSpace),
          link: {
            to: '/admin/projects/spaces/$spaceId/settings',
            params: { spaceId },
          },
        },
      ]
    : [];

  return { canManage, entries };
};

export default useSpaceActions;
