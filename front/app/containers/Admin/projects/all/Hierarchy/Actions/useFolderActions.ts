import useReorderAdminPublication from 'api/admin_publications/useReorderAdminPublication';
import useUpdateProjectFolder from 'api/project_folders/useUpdateProjectFolder';

import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import { ArrangePlace } from '../Arrange/arrangeTargets';
import useArrangeEntry from '../Arrange/useArrangeEntry';
import { MenuEntry } from '../Menu/FlyoutMenu';
import messages from '../messages';
import useMoveToEntry from '../Move/useMoveToEntry';

interface Params {
  folderId: string;
  folderSpaceId: string | null;
  // Where its tile or row can be arranged, and the publication that holds its
  // place. Only a tile or row can arrange or move the folder.
  arrange?: { place: ArrangePlace; adminPublicationId: string };
  movable?: boolean;
}

// What can be done on a folder wherever its "⋯" is, its tile, its row or its
// level, for those who manage it.
const useFolderActions = ({
  folderId,
  folderSpaceId,
  arrange,
  movable = false,
}: Params) => {
  const { formatMessage } = useIntl();
  const canModerate = usePermission({
    item: 'project_folder',
    action: 'moderate',
    context: { folderId, folderSpaceId },
  });
  const canReorder = usePermission({
    item: 'project_folder',
    action: 'reorder',
    context: { folderSpaceId },
  });
  const canMove = usePermission({
    item: 'project_folder',
    action: 'move',
    context: { folderSpaceId },
  });
  const { mutateAsync: reorderPublication } = useReorderAdminPublication();
  const { mutateAsync: updateFolder } = useUpdateProjectFolder();

  const arrangeEntries = useArrangeEntry(
    canReorder && arrange
      ? {
          place: arrange.place,
          reorder: (ordering) =>
            reorderPublication({ id: arrange.adminPublicationId, ordering }),
        }
      : undefined
  );

  const moveTo = useMoveToEntry(
    canMove && movable
      ? {
          item: 'folder',
          here: { space_id: folderSpaceId },
          move: (placement) =>
            updateFolder({ projectFolderId: folderId, ...placement }),
        }
      : undefined
  );

  const entries: MenuEntry[] = canModerate
    ? [
        ...arrangeEntries,
        ...moveTo,
        {
          key: 'edit',
          icon: 'edit',
          label: formatMessage(messages.editFolder),
          link: {
            to: '/admin/projects/folders/$projectFolderId/settings',
            params: { projectFolderId: folderId },
          },
          dividerBefore: arrangeEntries.length + moveTo.length > 0,
        },
      ]
    : [];

  return { canModerate, entries };
};

export default useFolderActions;
