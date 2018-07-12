import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// services
import { IProjectData, reorderProject } from 'services/projects';
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';

// localisation
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import messages from '../messages';

// components
import { SortableList, SortableRow, List, Row } from 'components/admin/ResourceList';
import PageWrapper, { ButtonWrapper } from 'components/admin/PageWrapper';
import Button from 'components/UI/Button';
import Title from 'components/admin/PageTitle';
import StatusLabel from 'components/UI/StatusLabel';
import HasPermission from 'components/HasPermission';
import { fontSizes } from 'utils/styleUtils';

// style
import styled from 'styled-components';

const StyledRow = styled(Row)`
  &:first-child {
    border-top: none !important
  }
`;

const RowContent = styled.div`
  font-size: ${fontSizes.large}px;
  font-weight: 400;
  line-height: 22px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

interface InputProps {}

interface DataProps {
  projects: GetProjectsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class AdminProjectsList extends PureComponent<Props, State> {

  handleReorder = (projectId, newOrder) => {
    reorderProject(projectId, newOrder);
  }

  renderRow = (project : IProjectData) => {
    return (
      <RowContent>
        <div className="expand primary">
          <T value={project.attributes.title_multiloc} />
          {project.attributes.publication_status !== 'published' &&
            <StatusLabel color={project.attributes.publication_status === 'archived' ? 'clBlue' : 'draftYellow'}>
              <FormattedMessage {...messages[`${project.attributes.publication_status}Status`]} />
            </StatusLabel>
          }
        </div>
        <Button
          className={`e2e-admin-edit-project ${project.attributes.process_type === 'timeline' ? 'timeline' : 'continuous'}`}
          linkTo={`/admin/projects/${project.id}/edit`}
          style="secondary"
          circularCorners={false}
          icon="edit"
        >
          <FormattedMessage {...messages.editButtonLabel} />
        </Button>
      </RowContent>
    );
  }

  render () {
    const { projectsList } = this.props.projects;

    if (!isNilOrError(projectsList)) {
      return (
        <>
          <Title>
            <FormattedMessage {...messages.overviewPageTitle} />
          </Title>

          <PageWrapper>
            <HasPermission item={{ type: 'route', path: '/admin/projects/new' }} action="access">
              <ButtonWrapper>
                <Button className="e2e-admin-add-project" linkTo="/admin/projects/new" style="cl-blue" circularCorners={false} icon="plus-circle">
                  <FormattedMessage {...messages.addNewProject} />
                </Button>
              </ButtonWrapper>
             </HasPermission>
             <HasPermission item="projects" action="reorder">
              <SortableList items={projectsList} onReorder={this.handleReorder} className="e2e-admin-projects-list">
                {({ itemsList, handleDragRow, handleDropRow }) => (
                  itemsList.map((project: IProjectData, index: number) => (
                    <SortableRow
                      key={project.id}
                      id={project.id}
                      index={index}
                      moveRow={handleDragRow}
                      dropRow={handleDropRow}
                    >
                      {this.renderRow(project)}
                    </SortableRow>
                  ))
                )}
              </SortableList>
              <HasPermission.No>
                <List>
                  {projectsList.map((project: IProjectData) => (
                    <StyledRow
                      key={project.id}
                    >
                      {this.renderRow(project)}
                    </StyledRow>
                  ))
                }
              </List>
            </HasPermission.No>
          </HasPermission>

          </PageWrapper>
        </>
      );
    }

    return null;
  }
}

export default (inputProps: InputProps) => (
  <GetProjects publicationStatuses={['draft', 'published', 'archived']} filterCanModerate={true}>
    {projects => <AdminProjectsList {...inputProps} projects={projects} />}
  </GetProjects>
);
