import useReorderAdminPublication from 'api/admin_publications/useReorderAdminPublication';
import useUpdateProject from 'api/projects/useUpdateProject';
import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';

import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import { ArrangePlace } from '../Arrange/arrangeTargets';
import useArrange from '../Arrange/useArrange';
import { MenuEntry } from '../Menu/FlyoutMenu';
import messages from '../messages';
import useMoveToEntry from '../Move/useMoveToEntry';

// What can be done on a project from its card or row. Everyone sees only
// projects they manage, so everyone can edit the ones listed.
const useProjectActions = (
  project: ProjectMiniAdminData,
  place?: ArrangePlace
) => {
  const { formatMessage } = useIntl();
  const { admin_publication_id } = project.attributes;
  const folderId = project.relationships.folder?.data?.id ?? null;
  const spaceId = project.relationships.space?.data?.id ?? null;
  const canReorder = usePermission({
    item: 'project',
    action: 'reorder',
    context: { folderId, spaceId },
  });
  const canMove = usePermission({
    item: 'project',
    action: 'move',
    context: { spaceId },
  });
  const { mutateAsync: reorderPublication } = useReorderAdminPublication();
  const { mutateAsync: updateProject } = useUpdateProject();

  const arrange = useArrange(
    canReorder && place
      ? {
          place,
          reorder: (ordering) =>
            reorderPublication({ id: admin_publication_id, ordering }),
        }
      : undefined
  );

  const moveToEntries = useMoveToEntry(
    canMove
      ? {
          item: 'project',
          here: { folder_id: folderId, space_id: spaceId },
          move: (placement) =>
            updateProject({ projectId: project.id, ...placement }),
        }
      : undefined
  );

  const entries: MenuEntry[] = [
    ...arrange.entries,
    ...moveToEntries,
    {
      key: 'edit',
      icon: 'edit',
      label: formatMessage(messages.editProject),
      link: {
        to: '/admin/projects/$projectId/general',
        params: { projectId: project.id },
      },
      dividerBefore: arrange.entries.length + moveToEntries.length > 0,
    },
  ];

  return { entries, arrangeTo: arrange.arrangeTo };
};

export default useProjectActions;
