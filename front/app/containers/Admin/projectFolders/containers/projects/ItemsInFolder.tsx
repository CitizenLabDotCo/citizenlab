import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// api
import useUpdateProjectFolderMembership from 'api/projects/useUpdateProjectFolderMembership';

// services
import { PublicationStatus } from 'services/projects';
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
  const { mutate: updateProjectFolderMembership } =
    useUpdateProjectFolderMembership();

  const [processing, setProcessing] = useState<string[]>([]);

  const handleReorder = (itemId: string, newOrder: number) => {
    reorderAdminPublication(itemId, newOrder);
  };

  const removeProjectFromFolder =
    (projectFolderId: string) => (projectId: string) => async () => {
      setProcessing([...processing, projectId]);

      updateProjectFolderMembership(
        {
          projectId,
          newProjectFolderId: null,
          oldProjectFolderId: projectFolderId,
        },
        {
          onSuccess: () => {
            setProcessing(processing.filter((item) => projectId !== item));
          },
        }
      );
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
                                handler:
                                  removeProjectFromFolder(projectFolderId),
                                icon: 'minus-circle',
                                processing: processing.includes(
                                  adminPublication.publicationId
                                ),
                              },
                              'manage',
                            ]
                          : ['manage']
                      }
                      hideMoreActions
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
