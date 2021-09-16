import React, { Component } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'react-router';

// services
import { PublicationStatus } from 'services/projects';
import { updateProjectFolderMembership } from '../../../services/projects';
import { isAdmin } from 'services/permissions/roles';

// resources
import GetProjectFolder, {
  GetProjectFolderChildProps,
} from '../../../resources/GetProjectFolder';
import GetAdminPublications, {
  GetAdminPublicationsChildProps,
} from 'resources/GetAdminPublications';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

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
import { IAdminPublicationContent } from 'hooks/useAdminPublications';

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

interface DataProps {
  adminPublications: GetAdminPublicationsChildProps;
  projectFolder: GetProjectFolderChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends DataProps {}

interface State {
  processing: string[];
}

class AdminFolderProjectsList extends Component<
  Props & WithRouterProps,
  State
> {
  constructor(props) {
    super(props);

    this.state = {
      processing: [],
    };
  }

  handleReorder = (itemId, newOrder) => {
    reorderAdminPublication(itemId, newOrder);
  };

  addProjectToFolder = (projectFolderId: string) => (
    projectId: string
  ) => async () => {
    this.setState(({ processing }) => ({
      processing: [...processing, projectId],
    }));
    await updateProjectFolderMembership(projectId, projectFolderId);
    this.setState(({ processing }) => ({
      processing: processing.filter((item) => item !== projectId),
    }));
  };

  removeProjectFromFolder = (projectFolderId: string) => (
    projectId: string
  ) => async () => {
    this.setState(({ processing }) => ({
      processing: [...processing, projectId],
    }));
    await updateProjectFolderMembership(projectId, null, projectFolderId);
    this.setState(({ processing }) => ({
      processing: processing.filter((item) => item !== projectId),
    }));
  };

  render() {
    const { adminPublications, authUser, projectFolder } = this.props;
    const { processing } = this.state;
    const { list: allPublications } = adminPublications;
    const userIsAdmin = authUser && isAdmin({ data: authUser });

    if (isNilOrError(projectFolder)) return null;

    const projectsInFolder = adminPublications.childrenOf({
      id: projectFolder.relationships.admin_publication.data?.id,
    });

    const otherProjects = !isNilOrError(allPublications)
      ? allPublications.filter(
          (item) =>
            item.publicationType === 'project' && item.attributes.depth === 0
        )
      : null;

    const projectFolderId = projectFolder.id;
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
              onReorder={this.handleReorder}
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
                                      handler: this.removeProjectFromFolder(
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
                              handler: this.addProjectToFolder(projectFolderId),
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
  }
}
const publicationStatuses: PublicationStatus[] = [
  'draft',
  'archived',
  'published',
];

const Data = adopt<DataProps, WithRouterProps>({
  authUser: <GetAuthUser />,
  projectFolder: ({ params, render }) => (
    <GetProjectFolder projectFolderId={params.projectFolderId}>
      {render}
    </GetProjectFolder>
  ),
  adminPublications: ({ render }) => (
    <GetAdminPublications publicationStatusFilter={publicationStatuses}>
      {render}
    </GetAdminPublications>
  ),
});

export default withRouter((inputProps: WithRouterProps) => (
  <Data {...inputProps}>
    {(dataProps) => <AdminFolderProjectsList {...inputProps} {...dataProps} />}
  </Data>
));
