import React, { Component } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// services
import { reorderProject, updateProjectFolderMembership, PublicationStatus } from 'services/projects';

// resources
import GetProjectFolder, { GetProjectFolderChildProps } from 'resources/GetProjectFolder';
import GetProject from 'resources/GetProject';
import GetProjectHolderOrderings, { GetProjectHolderOrderingsChildProps } from 'resources/GetProjectHolderOrderings';

// localisation
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// components
import { List, Row, SortableList, SortableRow } from 'components/admin/ResourceList';
import { HeaderTitle } from '../../all/StyledComponents';
import ProjectRow from '../../components/ProjectRow';

// style
import styled from 'styled-components';

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
  projectHoldersOrderings: GetProjectHolderOrderingsChildProps;
  projectFolder: GetProjectFolderChildProps;
}

interface Props extends DataProps { }

class AdminFoldersProjectsList extends Component<Props & WithRouterProps> {

  handleReorder = (projectId, newOrder) => {
    console.log(projectId, newOrder);
    reorderProject(projectId, newOrder);
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
    const { projectHoldersOrderings, projectFolder } = this.props;

    const otherProjectIds = (!isNilOrError(projectHoldersOrderings) && projectHoldersOrderings.list)
      ? projectHoldersOrderings.list.filter(item => item.projectHolderType === 'project').map(item => item.projectHolder.id)
      : null;

    const inFolderProjectIds = !isNilOrError(projectFolder) && projectFolder.relationships.projects
      ? projectFolder.relationships.projects.data.map(projectRel => projectRel.id)
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

          {inFolderProjectIds && inFolderProjectIds.length > 0 ?
            <SortableList
              key={`IN_FOLDER_LIST${inFolderProjectIds.length}`}
              items={inFolderProjectIds}
              onReorder={this.handleReorder}
              className="projects-list e2e-admin-folder-projects-list"
              id="e2e-admin-fodlers-projects-list"
            >
              {({ itemsList, handleDragRow, handleDropRow }) => (
                itemsList.map((projectId, index) => {
                  return (
                    <SortableRow
                      key={projectId}
                      id={projectId}
                      index={index}
                      moveRow={handleDragRow}
                      dropRow={handleDropRow}
                      lastItem={(index === itemsList.length - 1)}
                    >
                      <GetProject projectId={projectId} key={`in_${projectId}`}>
                        {project => isNilOrError(project) ? null : (
                          <ProjectRow
                            project={project}
                            actions={[{
                              buttonContent: <FormattedMessage {...messages.removeFromFolder} />,
                              handler: this.removeProjectFromFolder,
                              icon: 'remove'
                            }, 'manage']}
                          />
                        )}
                      </GetProject>
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

          {otherProjectIds && otherProjectIds.length > 0 ?
            <List key={`JUST_LIST${otherProjectIds.length}`}>
              {otherProjectIds.map((projectId, index: number) => {
                return (
                  <GetProject projectId={projectId} key={`out_${projectId}`}>
                    {project => isNilOrError(project) ? null : (
                      <Row
                        id={projectId}
                        lastItem={(index === otherProjectIds.length - 1)}
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
                    )}
                  </GetProject>
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
  projectHoldersOrderings: <GetProjectHolderOrderings publicationStatusFilter={publicationStatuses} />,
});

export default (inputProps: WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <AdminFoldersProjectsListWithHocs {...inputProps} {...dataProps} />}
  </Data>
);
