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
import { List, Row } from 'components/admin/ResourceList';
import { HeaderTitle } from '../../all/StyledComponents';
import ProjectRow from '../../components/ProjectRow';

// style
import styled from 'styled-components';
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';

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

const ListTitle = styled.h4`
  font-weight: normal;
  font-style: italic;
`;

const Spacer = styled.div`
  flex: 1;
`;

interface DataProps {
  projectHoldersOrderings: GetProjectHolderOrderingsChildProps;
  projectFolder: GetProjectFolderChildProps;
  projects: GetProjectsChildProps;
}

interface Props extends DataProps { }

class AdminFoldersProjectsList extends Component<Props & WithRouterProps> {

  handleReorder = (projectId, newOrder) => {
    reorderProject(projectId, newOrder); // TODO
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
    const { projectHoldersOrderings, projectFolder, projects: { projectsList } } = this.props;
    const otherPublishedProjectIds = (!isNilOrError(projectHoldersOrderings) && projectHoldersOrderings.list)
      ? projectHoldersOrderings.list.filter(item => item.projectHolderType === 'project').map(item => item.projectHolder.id)
      : null;
    const hasOtherPublishedProjectIds = otherPublishedProjectIds && otherPublishedProjectIds.length > 0;

    const otherDraftProjectIds = !isNilOrError(projectsList)
      ? projectsList
        .filter(item => item.attributes.publication_status === 'draft')
        .map(item => item.id)
      : null;
    const hasOtherDraftProjectIds = otherDraftProjectIds && otherDraftProjectIds.length > 0;

    const otherArchivedProjectIds = !isNilOrError(projectsList)
      ? projectsList
        .filter(item => item.attributes.publication_status === 'archived')
        .map(item => item.id)
      : null;
    const hasOtherArchivedProjectIds = otherArchivedProjectIds && otherArchivedProjectIds.length > 0;

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
            <List key={`IN_FOLDER_LIST${inFolderProjectIds.length}`}>
              {inFolderProjectIds.map((inFolderProjectId, index: number) => {
                return (
                  <GetProject projectId={inFolderProjectId} key={`in_${inFolderProjectId}`}>
                    {project => isNilOrError(project) ? null : (
                      <Row
                        id={inFolderProjectId}
                        lastItem={(index === inFolderProjectIds.length - 1)}
                      >
                        <ProjectRow
                          project={project}
                          actions={[{
                            buttonContent: <FormattedMessage {...messages.removeFromFolder} />,
                            handler: this.removeProjectFromFolder,
                            icon: 'remove'
                          }, 'manage']}
                        />
                      </Row>
                    )}
                  </GetProject>
                );
              })}
            </List>
            :
            <FormattedMessage {...messages.emptyFolder} />
          }
          {(hasOtherDraftProjectIds || hasOtherArchivedProjectIds || hasOtherPublishedProjectIds) &&
            <ListHeader>
              <StyledHeaderTitle>
                <FormattedMessage {...messages.projectsYouCanAdd} />
              </StyledHeaderTitle>
            </ListHeader>
          }

          {otherPublishedProjectIds && otherPublishedProjectIds.length > 0 &&
            <>
              <ListHeader>
                <ListTitle>
                  <FormattedMessage {...messages.otherPublishedProjects} />
                </ListTitle>
              </ListHeader>
              <List key={`JUST_LIST${otherPublishedProjectIds.length}`}>
                {otherPublishedProjectIds.map((projectId, index: number) => {
                  return (
                    <GetProject projectId={projectId} key={`out_${projectId}`}>
                      {project => isNilOrError(project) ? null : (
                        <Row
                          id={projectId}
                          lastItem={(index === otherPublishedProjectIds.length - 1)}
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
            </>
          }

          {otherArchivedProjectIds && otherArchivedProjectIds.length > 0 &&
            <>
              <ListHeader>
                <ListTitle>
                  <FormattedMessage {...messages.otherArchivedProjects} />
                </ListTitle>
              </ListHeader>
              <List key={`JUST_LIST${otherArchivedProjectIds.length}`}>
                {otherArchivedProjectIds.map((projectId, index: number) => {
                  return (
                    <GetProject projectId={projectId} key={`out_${projectId}`}>
                      {project => isNilOrError(project) ? null : (
                        <Row
                          id={projectId}
                          lastItem={(index === otherArchivedProjectIds.length - 1)}
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
            </>
          }
          {otherDraftProjectIds && otherDraftProjectIds.length > 0 &&
            <>
              <ListHeader>
                <ListTitle>
                  <FormattedMessage {...messages.otherDraftProjects} />
                </ListTitle>
              </ListHeader>
              <List key={`JUST_LIST${otherDraftProjectIds.length}`}>
                {otherDraftProjectIds.map((projectId, index: number) => {
                  return (
                    <GetProject projectId={projectId} key={`out_${projectId}`}>
                      {project => isNilOrError(project) ? null : (
                        <Row
                          id={projectId}
                          lastItem={(index === otherDraftProjectIds.length - 1)}
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
            </>
          }
        </ListsContainer>
      </Container>
    );
  }
}
const AdminFoldersProjectsListWithHocs = withRouter(AdminFoldersProjectsList);

const publicationStatuses: PublicationStatus[] = ['draft', 'archived'];

const Data = adopt<DataProps, WithRouterProps>({
  projectFolder: ({ params, render }) => <GetProjectFolder projectFolderId={params.projectFolderId}>{render}</GetProjectFolder>,
  projectHoldersOrderings: <GetProjectHolderOrderings />,
  projects: <GetProjects publicationStatuses={publicationStatuses} folderId="nil" />
});

export default (inputProps: WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <AdminFoldersProjectsListWithHocs {...inputProps} {...dataProps} />}
  </Data>
);
