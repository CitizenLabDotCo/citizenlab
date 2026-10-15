import useReorderSpace from 'api/spaces/useReorderSpace';

import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import { ArrangePlace } from '../Arrange/arrangeTargets';
import useArrangeEntry from '../Arrange/useArrangeEntry';
import { MenuEntry } from '../Menu/FlyoutMenu';
import messages from '../messages';

// What can be done on a space wherever its "⋯" is, its tile, its row or its
// level, for those who manage it. Only its tile and row have a place to
// arrange it in.
const useSpaceActions = (spaceId: string, place?: ArrangePlace) => {
  const { formatMessage } = useIntl();
  const canManage = usePermission({
    item: 'space',
    action: 'manage_projects_and_folders',
    context: { spaceId },
  });
  const canReorder = usePermission({ item: 'space', action: 'reorder' });
  const { mutateAsync: reorderSpace } = useReorderSpace();

  const arrange = useArrangeEntry(
    canReorder && place
      ? {
          place,
          reorder: (ordering) => reorderSpace({ id: spaceId, ordering }),
        }
      : undefined
  );

  const entries: MenuEntry[] = canManage
    ? [
        ...arrange,
        {
          key: 'edit',
          icon: 'edit',
          label: formatMessage(messages.editSpace),
          link: {
            to: '/admin/projects/spaces/$spaceId/settings',
            params: { spaceId },
          },
          dividerBefore: arrange.length > 0,
        },
      ]
    : [];

  return { canManage, entries };
};

export default useSpaceActions;
