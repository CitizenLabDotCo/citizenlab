import React, { useState } from 'react';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useAdminPublications from 'api/admin_publications/useAdminPublications';
import useReorderAdminPublication from 'api/admin_publications/useReorderAdminPublication';
import useAuthUser from 'api/me/useAuthUser';
import { PublicationStatus } from 'api/projects/types';
import useUpdateProjectFolderMembership from 'api/projects/useUpdateProjectFolderMembership';

import ProjectRow from 'containers/Admin/projects/components/ProjectRow';

import SortableList from 'components/admin/ResourceList/SortableList';
import SortableRow from 'components/admin/ResourceList/SortableRow';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { usePermission } from 'utils/permissions';

// localisation
import messages from '../messages';

const publicationStatuses: PublicationStatus[] = [
  'draft',
  'archived',
  'published',
];

export interface Props {
  projectFolderId: string;
}

const ItemsInFolder = ({ projectFolderId }: Props) => {
  const { data: authUser } = useAuthUser();
  const { mutate: reorderAdminPublication } = useReorderAdminPublication();
  const { data } = useAdminPublications({
    childrenOfId: projectFolderId,
    publicationStatusFilter: publicationStatuses,
  });

  const canRemoveProjects = usePermission({
    item: 'project_folder',
    action: 'manage_projects',
  });

  const projectsInFolder = data?.pages.map((page) => page.data).flat();

  const { mutate: updateProjectFolderMembership } =
    useUpdateProjectFolderMembership();

  const [processing, setProcessing] = useState<string[]>([]);

  const handleReorder = (itemId: string, newOrder: number) => {
    reorderAdminPublication({ id: itemId, ordering: newOrder });
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
            {itemsList.map((adminPublication: IAdminPublicationData, index) => {
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
                      canRemoveProjects
                        ? [
                            {
                              buttonContent: (
                                <FormattedMessage
                                  {...messages.removeFromFolder}
                                />
                              ),
                              handler: removeProjectFromFolder(projectFolderId),
                              icon: 'minus-circle',
                              processing: processing.includes(
                                adminPublication.relationships.publication.data
                                  .id
                              ),
                            },
                            'manage',
                          ]
                        : ['manage']
                    }
                    hideMoreActions
                    folderId={projectFolderId}
                  />
                </SortableRow>
              );
            })}
          </>
        )}
      </SortableList>
    );
  }

  return <FormattedMessage {...messages.folderEmptyGoBackToAdd} />;
};

export default ItemsInFolder;
