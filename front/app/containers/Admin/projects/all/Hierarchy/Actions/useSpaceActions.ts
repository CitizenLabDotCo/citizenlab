import useReorderSpace from 'api/spaces/useReorderSpace';

import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import { ArrangePlace } from '../Arrange/arrangeTargets';
import useArrange from '../Arrange/useArrange';
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

  const arrange = useArrange(
    canReorder && place
      ? {
          place,
          reorder: (ordering) => reorderSpace({ id: spaceId, ordering }),
        }
      : undefined
  );

  const entries: MenuEntry[] = canManage
    ? [
        ...arrange.entries,
        {
          key: 'edit',
          icon: 'edit',
          label: formatMessage(messages.editSpace),
          link: {
            to: '/admin/projects/spaces/$spaceId/settings',
            params: { spaceId },
          },
          dividerBefore: arrange.entries.length > 0,
        },
      ]
    : [];

  return { canManage, entries, arrangeTo: arrange.arrangeTo };
};

export default useSpaceActions;
