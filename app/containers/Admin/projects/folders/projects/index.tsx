import React, { Component } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// services
import { updateProjectFolderMembership, PublicationStatus } from 'services/projects';

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

interface State {
  processing: string[];
}

class AdminFoldersProjectsList extends Component<Props & WithRouterProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      processing: []
    };
  }

  handleReorder = (itemId, newOrder) => {
    reorderAdminPublication(itemId, newOrder);
  }

  addProjectToFolder = (projectId: string) => async () => {
    const projectFolderId = !isNilOrError(this.props.projectFolder) ? this.props.projectFolder.id : null;
    if (projectFolderId) {
      this.setState(({ processing }) => ({ processing: [...processing, projectId] }));
      await updateProjectFolderMembership(projectId, projectFolderId);
      this.setState(({ processing }) => ({ processing: processing.filter(item => item !== projectId) }));
    }
  }

  removeProjectFromFolder = (projectId: string) => async () => {
    const projectFolderId = !isNilOrError(this.props.projectFolder) ? this.props.projectFolder.id : undefined;
    this.setState(({ processing }) => ({ processing: [...processing, projectId] }));
    await updateProjectFolderMembership(projectId, null, projectFolderId);
    this.setState(({ processing }) => ({ processing: processing.filter(item => item !== projectId) }));
  }

  render() {
    const { topLevelProjects, projectsInFolder } = this.props;

    const { processing } = this.state;

    const otherProjects = (!isNilOrError(topLevelProjects) && topLevelProjects.list)
      ? topLevelProjects.list.filter(item => item.publicationType === 'project')
      : null;

    const inFolderFinalList = (!isNilOrError(projectsInFolder) && projectsInFolder.list && projectsInFolder.list.length > 0)
      ? projectsInFolder.list.filter(item => item.publicationType === 'project')
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
                        publication={adminPublication}
                        actions={[{
                          buttonContent: <FormattedMessage {...messages.removeFromFolder} />,
                          handler: this.removeProjectFromFolder,
                          icon: 'remove',
                          processing: processing.includes(adminPublication.publicationId)
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
              {otherProjects.map((adminPublication, index: number) => {
                return (
                  <Row
                    id={adminPublication.id}
                    lastItem={(index === otherProjects.length - 1)}
                    key={adminPublication.id}
                  >
                    <ProjectRow
                      publication={adminPublication}
                      actions={[{
                        buttonContent: <FormattedMessage {...messages.addToFolder} />,
                        handler: this.addProjectToFolder,
                        processing: processing.includes(adminPublication.publicationId),
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
  topLevelProjects: <GetAdminPublications publicationStatusFilter={publicationStatuses} folderId={null} />,
  projectsInFolder: ({ params, render }) => <GetAdminPublications publicationStatusFilter={publicationStatuses} folderId={params.projectFolderId}>{render}</GetAdminPublications>,
});

export default (inputProps: WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <AdminFoldersProjectsListWithHocs {...inputProps} {...dataProps} />}
  </Data>
);
