import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// services
import { PublicationStatus } from 'services/projects';
import { updateProjectFolderMembership } from '../../../services/projects';
import { isAdmin } from 'services/permissions/roles';

// hooks
import useAdminPublications, {
  IAdminPublicationContent,
} from 'hooks/useAdminPublications';
import useAdminPublicationChildren from 'hooks/useAdminPublicationChildren';
import useAuthUser from 'hooks/useAuthUser';
import useProjectFolder from '../../../hooks/useProjectFolder';

// localisation
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// components
import {
  List,
  Row,
  SortableList,
  SortableRow,
} from 'components/admin/ResourceList';
import { HeaderTitle } from 'containers/Admin/projects/all/StyledComponents';
import ProjectRow from 'containers/Admin/projects/components/ProjectRow';

// style
import styled from 'styled-components';
import { reorderAdminPublication } from 'services/adminPublications';

const Container = styled.div`
  min-height: 60vh;
`;

const ListsContainer = styled.div``;

const ListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 25px;

  &:not(:first-child) {
    margin-top: 70px;
  }

  & + & {
    margin-top: 30px;
  }
`;

const StyledHeaderTitle = styled(HeaderTitle)`
  font-weight: bold;
`;

const Spacer = styled.div`
  flex: 1;
`;

const publicationStatuses: PublicationStatus[] = [
  'draft',
  'archived',
  'published',
];

const AdminFolderProjectsList = ({
  params: { projectFolderId },
}: WithRouterProps) => {
  const { list: allPublications } = useAdminPublications({
    publicationStatusFilter: publicationStatuses,
  });

  const authUser = useAuthUser();
  const projectFolder = useProjectFolder({ projectFolderId });
  const projectsInFolder = useAdminPublicationChildren({
    publicationId: !isNilOrError(projectFolder)
      ? projectFolder.relationships.admin_publication.data?.id
      : undefined,
    publicationStatuses,
  });

  if (isNilOrError(projectsInFolder)) return null;

  const [processing, setProcessing] = useState<string[]>([]);

  if (isNilOrError(authUser)) return null;

  const handleReorder = (itemId, newOrder) => {
    reorderAdminPublication(itemId, newOrder);
  };

  const addProjectToFolder = (projectFolderId: string) => (
    projectId: string
  ) => async () => {
    setProcessing([...processing, projectId]);
    await updateProjectFolderMembership(projectId, projectFolderId);
    setProcessing(processing.filter((item) => projectId !== item));
  };

  const removeProjectFromFolder = (projectFolderId: string) => (
    projectId: string
  ) => async () => {
    setProcessing([...processing, projectId]);
    await updateProjectFolderMembership(projectId, null, projectFolderId);
    setProcessing(processing.filter((item) => projectId !== item));
  };

  const userIsAdmin = authUser && isAdmin({ data: authUser });

  const otherProjects = !isNilOrError(allPublications)
    ? allPublications.filter(
        (item) =>
          item.publicationType === 'project' && item.attributes.depth === 0
      )
    : null;

  return (
    <Container>
      <ListsContainer>
        <ListHeader>
          <StyledHeaderTitle>
            <FormattedMessage {...messages.projectsAlreadyAdded} />
          </StyledHeaderTitle>
          <Spacer />
        </ListHeader>

        {!isNilOrError(projectsInFolder) && projectsInFolder.length > 0 ? (
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
                        lastItem={index === itemsList.length - 1}
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
        ) : (
          <FormattedMessage {...messages.folderEmptyGoBackToAdd} />
        )}

        {userIsAdmin && (
          <>
            <ListHeader>
              <StyledHeaderTitle>
                <FormattedMessage {...messages.projectsYouCanAdd} />
              </StyledHeaderTitle>
            </ListHeader>

            {otherProjects ? (
              <List>
                <>
                  {otherProjects.map((adminPublication, index: number) => (
                    <Row
                      id={adminPublication.id}
                      isLastItem={index === otherProjects.length - 1}
                      key={adminPublication.id}
                    >
                      <ProjectRow
                        publication={adminPublication}
                        actions={[
                          {
                            buttonContent: (
                              <FormattedMessage {...messages.addToFolder} />
                            ),
                            handler: addProjectToFolder(projectFolderId),
                            processing: processing.includes(
                              adminPublication.publicationId
                            ),
                            icon: 'plus-circle',
                          },
                        ]}
                      />
                    </Row>
                  ))}
                </>
              </List>
            ) : (
              <FormattedMessage {...messages.noProjectsToAdd} />
            )}
          </>
        )}
      </ListsContainer>
    </Container>
  );
};

export default withRouter(AdminFolderProjectsList);
