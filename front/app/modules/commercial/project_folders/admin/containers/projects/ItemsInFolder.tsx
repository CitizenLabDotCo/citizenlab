import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// services
import { PublicationStatus } from 'services/projects';
import { updateProjectFolderMembership } from '../../../services/projects';
import { isAdmin } from 'services/permissions/roles';

// hooks
import useAdminPublications, {
  IAdminPublicationContent,
} from 'hooks/useAdminPublications';
import useAuthUser from 'hooks/useAuthUser';

// localisation
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// components
import { SortableList, SortableRow } from 'components/admin/ResourceList';
import ProjectRow from 'containers/Admin/projects/components/ProjectRow';

// style
import { reorderAdminPublication } from 'services/adminPublications';

const publicationStatuses: PublicationStatus[] = [
  'draft',
  'archived',
  'published',
];

interface Props {
  projectFolderId: string;
}

const ItemsInFolder = ({ projectFolderId }: Props) => {
  const authUser = useAuthUser();
  const { list: projectsInFolder } = useAdminPublications({
    childrenOfId: projectFolderId,
    publicationStatusFilter: publicationStatuses,
  });

  const [processing, setProcessing] = useState<string[]>([]);

  const handleReorder = (itemId: string, newOrder: number) => {
    reorderAdminPublication(itemId, newOrder);
  };

  const removeProjectFromFolder = (projectFolderId: string) => (
    projectId: string
  ) => async () => {
    setProcessing([...processing, projectId]);
    await updateProjectFolderMembership(projectId, null, projectFolderId);
    setProcessing(processing.filter((item) => projectId !== item));
  };

  if (
    !isNilOrError(authUser) &&
    !isNilOrError(projectsInFolder) &&
    // the length check is needed because an empty array
    // is also truthy, so we won't reach the fallback message
    projectsInFolder.length > 0
  ) {
    const userIsAdmin = authUser && isAdmin({ data: authUser });

    return (
      <SortableList
        key={`IN_FOLDER_LIST${projectsInFolder.length}`}
        items={projectsInFolder}
        onReorder={handleReorder}
        className="projects-list e2e-admin-folder-projects-list"
        id="e2e-admin-folders-projects-list"
      >
        {({ itemsList, handleDragRow, handleDropRow }) => (
          <>
            {itemsList.map(
              (adminPublication: IAdminPublicationContent, index) => {
                return (
                  <SortableRow
                    key={adminPublication.id}
                    id={adminPublication.id}
                    index={index}
                    moveRow={handleDragRow}
                    dropRow={handleDropRow}
                    isLastItem={index === itemsList.length - 1}
                  >
                    <ProjectRow
                      publication={adminPublication}
                      actions={
                        userIsAdmin
                          ? [
                              {
                                buttonContent: (
                                  <FormattedMessage
                                    {...messages.removeFromFolder}
                                  />
                                ),
                                handler: removeProjectFromFolder(
                                  projectFolderId
                                ),
                                icon: 'remove',
                                processing: processing.includes(
                                  adminPublication.publicationId
                                ),
                              },
                              'manage',
                            ]
                          : ['manage']
                      }
                    />
                  </SortableRow>
                );
              }
            )}
          </>
        )}
      </SortableList>
    );
  }

  return <FormattedMessage {...messages.folderEmptyGoBackToAdd} />;
};

export default ItemsInFolder;
