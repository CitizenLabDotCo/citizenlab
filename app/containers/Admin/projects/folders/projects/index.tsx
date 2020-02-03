import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// services
import { IProjectData, reorderProject, updateProjectFolderMembership } from 'services/projects';

// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import GetProjectFolder, { GetProjectFolderChildProps } from 'resources/GetProjectFolder';

// localisation
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// components
import { SortableList, SortableRow, List, Row } from 'components/admin/ResourceList';
import IconTooltip from 'components/UI/IconTooltip';

// style
import styled from 'styled-components';
import ProjectRow from '../../components/ProjectRow';
import { HeaderTitle } from '../../all/styles';
import { withRouter, WithRouterProps } from 'react-router';

const Container = styled.div``;

const ListsContainer = styled.div``;

const ListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 25px;

  & ~ & {
    margin-top: 70px;
  }
`;

const Spacer = styled.div`
  flex: 1;
`;

export interface InputProps {
}

interface DataProps {
  projects: GetProjectsChildProps;
  projectFolder: GetProjectFolderChildProps;
}

interface Props extends InputProps, DataProps { }

interface State {
}

class AdminFoldersProjectsList extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  handleReorder = (projectId, newOrder) => {
    reorderProject(projectId, newOrder); // TODO
  }

  addProjectToFolder = (projectId) => () => {
    const projectFolderId = !isNilOrError(this.props.projectFolder) ? this.props.projectFolder.id : null;

    projectFolderId && updateProjectFolderMembership(projectId, projectFolderId);
  }

  render() {
    const { projects, projectFolder } = this.props;
    const projectList = projects && !isNilOrError(projects.projectsList) ? projects.projectsList : null;
    const inFolderProjects = !isNilOrError(projectFolder) && projectFolder.relationships.projects ?
      projectFolder.relationships.projects.data.map(projectRel => projectRel.id
      ) : null;

    return (
      <Container>
        <ListsContainer>
          <ListHeader>
            <HeaderTitle>
              <FormattedMessage {...messages.inFolder} />
            </HeaderTitle>

            <Spacer />

          </ListHeader>

          {inFolderProjects && inFolderProjects.length > 0 ?
            <SortableList
              items={inFolderProjects}
              onReorder={this.handleReorder}
              className="projects-list e2e-admin-projects-list"
              id="e2e-admin-published-projects-list"
            >
              {({ itemsList, handleDragRow, handleDropRow }) => (
                itemsList.map((project: IProjectData, index: number) => (
                  <SortableRow
                    key={project.id}
                    id={project.id}
                    index={index}
                    moveRow={handleDragRow}
                    dropRow={handleDropRow}
                    lastItem={(index === inFolderProjects.length - 1)}
                  >
                    <ProjectRow project={project} />
                  </SortableRow>
                ))
              )}
            </SortableList>
            :
            <FormattedMessage {...messages.emptyFolder} />
          }

          {projectList && projectList.length > 0 &&
            <>
              <ListHeader>
                <HeaderTitle>
                  <FormattedMessage {...messages.otherProjects} />
                </HeaderTitle>
                <IconTooltip content={<FormattedMessage {...messages.otherProjectsTooltip} />} />
              </ListHeader>
              <List>
                {projectList.map((project: IProjectData, index: number) => (
                  <Row
                    key={project.id}
                    id={project.id}
                    lastItem={(index === projectList.length - 1)}
                  >
                    <ProjectRow
                      project={project}
                      actions={[{
                        buttonContent: <FormattedMessage {...messages.addToFolder} />,
                        handler: this.addProjectToFolder,
                        icon: 'add'
                      }]}
                    />
                  </Row>
                ))}
              </List>
            </>
          }
        </ListsContainer>
      </Container>
    );
  }
}

const AdminFoldersProjectsListWithHocs = withRouter(AdminFoldersProjectsList);

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  projectFolder: ({ params, render }) => <GetProjectFolder projectFolderId={params.projectFolderId}>{render}</GetProjectFolder>,
  projects: <GetProjects publicationStatuses={['published']} filterCanModerate={true} />
});

export default (inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <AdminFoldersProjectsListWithHocs {...inputProps} {...dataProps} />}
  </Data>
);
