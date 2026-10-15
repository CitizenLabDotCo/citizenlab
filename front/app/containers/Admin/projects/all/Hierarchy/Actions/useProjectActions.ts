import useReorderAdminPublication from 'api/admin_publications/useReorderAdminPublication';
import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';

import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import { ArrangePlace } from '../Arrange/arrangeTargets';
import useArrangeEntry from '../Arrange/useArrangeEntry';
import { MenuEntry } from '../Menu/FlyoutMenu';
import messages from '../messages';

// What can be done on a project from its card or row. Everyone sees only
// projects they manage, so everyone can edit the ones listed.
const useProjectActions = (
  project: ProjectMiniAdminData,
  place?: ArrangePlace
) => {
  const { formatMessage } = useIntl();
  const { admin_publication_id } = project.attributes;
  const canReorder = usePermission({
    item: 'project',
    action: 'reorder',
    context: {
      folderId: project.relationships.folder?.data?.id,
      spaceId: project.relationships.space?.data?.id,
    },
  });
  const { mutateAsync: reorderPublication } = useReorderAdminPublication();

  const arrange = useArrangeEntry(
    canReorder && place
      ? {
          place,
          reorder: (ordering) =>
            reorderPublication({ id: admin_publication_id, ordering }),
        }
      : undefined
  );

  const entries: MenuEntry[] = [
    ...arrange,
    {
      key: 'edit',
      icon: 'edit',
      label: formatMessage(messages.editProject),
      link: {
        to: '/admin/projects/$projectId/general',
        params: { projectId: project.id },
      },
      dividerBefore: arrange.length > 0,
    },
  ];

  return { entries };
};

export default useProjectActions;
