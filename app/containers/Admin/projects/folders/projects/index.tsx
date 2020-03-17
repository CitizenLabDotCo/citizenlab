import React, { Component } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// services
import { reorderProject, updateProjectFolderMembership, PublicationStatus, IProjectData } from 'services/projects';

// resources
import GetProjectFolder, { GetProjectFolderChildProps } from 'resources/GetProjectFolder';
import GetAdminPublications, { GetAdminPublicationsChildProps } from 'resources/GetAdminPublications';

// localisation
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// components
import { List, Row, SortableList, SortableRow } from 'components/admin/ResourceList';
import { HeaderTitle } from '../../all/StyledComponents';
import ProjectRow from '../../components/ProjectRow';

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
  topLevelProjects: GetAdminPublicationsChildProps;
  projectFolder: GetProjectFolderChildProps;
  projectsInFolder: GetAdminPublicationsChildProps;
}

interface Props extends DataProps { }

class AdminFoldersProjectsList extends Component<Props & WithRouterProps> {

  handleReorder = (itemId, newOrder) => {
    reorderAdminPublication(itemId, newOrder);
  }

  addProjectToFolder = (projectId) => () => {
    const projectFolderId = !isNilOrError(this.props.projectFolder) ? this.props.projectFolder.id : null;
    projectFolderId && updateProjectFolderMembership(projectId, projectFolderId);
  }

  removeProjectFromFolder = (projectId) => () => {
    const projectFolderId = !isNilOrError(this.props.projectFolder) ? this.props.projectFolder.id : undefined;
    updateProjectFolderMembership(projectId, null, projectFolderId);
  }

  render() {
    const { topLevelProjects, projectsInFolder } = this.props;

    const otherProjects = (!isNilOrError(topLevelProjects) && topLevelProjects.list)
      ? topLevelProjects.list.filter(item => item.adminPublicationType === 'project').map(item => item.adminPublication) as IProjectData[]
      : null;

    const inFolderFinalList = (!isNilOrError(projectsInFolder) && projectsInFolder.list && projectsInFolder.list.length > 0)
    ? projectsInFolder.list.filter(item => item.adminPublicationType === 'project')
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

          {inFolderFinalList ?
            <SortableList
              key={`IN_FOLDER_LIST${inFolderFinalList.length}`}
              items={inFolderFinalList}
              onReorder={this.handleReorder}
              className="projects-list e2e-admin-folder-projects-list"
              id="e2e-admin-fodlers-projects-list"
            >
              {({ itemsList, handleDragRow, handleDropRow }) => (
                itemsList.map((adminPublication: IAdminPublicationContent, index) => {
                  return (
                    <SortableRow
                      key={adminPublication.id}
                      id={adminPublication.id}
                      index={index}
                      moveRow={handleDragRow}
                      dropRow={handleDropRow}
                      lastItem={(index === itemsList.length - 1)}
                    >
                      <ProjectRow
                        project={adminPublication.adminPublication as IProjectData}
                        actions={[{
                          buttonContent: <FormattedMessage {...messages.removeFromFolder} />,
                          handler: this.removeProjectFromFolder,
                          icon: 'remove'
                        }, 'manage']}
                      />
                    </SortableRow>
                  );
                })
              )}
            </SortableList>
            :
            <FormattedMessage {...messages.emptyFolder} />
          }
          <ListHeader>
            <StyledHeaderTitle>
              <FormattedMessage {...messages.projectsYouCanAdd} />
            </StyledHeaderTitle>
          </ListHeader>

          {otherProjects ?
            <List key={`JUST_LIST${otherProjects.length}`}>
              {otherProjects.map((project, index: number) => {
                return (
                  <Row
                    id={project.id}
                    lastItem={(index === otherProjects.length - 1)}
                  >
                    <ProjectRow
                      project={project}
                      actions={[{
                        buttonContent: <FormattedMessage {...messages.addToFolder} />,
                        handler: this.addProjectToFolder,
                        icon: 'plus-circle'
                      }]}
                    />
                  </Row>
                );
              })}
            </List>
            : <FormattedMessage {...messages.noProjectsToAdd} />
          }
        </ListsContainer>
      </Container>
    );
  }
}
const AdminFoldersProjectsListWithHocs = withRouter(AdminFoldersProjectsList);

const publicationStatuses: PublicationStatus[] = ['draft', 'archived', 'published'];

const Data = adopt<DataProps, WithRouterProps>({
  projectFolder: ({ params, render }) => <GetProjectFolder projectFolderId={params.projectFolderId}>{render}</GetProjectFolder>,
  topLevelProjects: <GetAdminPublications publicationStatusFilter={publicationStatuses} folderId={null}/>, // TODO !!
  projectsInFolder: ({ params, render }) => <GetAdminPublications publicationStatusFilter={publicationStatuses} folderId={params.projectFolderId}>{render}</GetAdminPublications>,
});

export default (inputProps: WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <AdminFoldersProjectsListWithHocs {...inputProps} {...dataProps} />}
  </Data>
);
