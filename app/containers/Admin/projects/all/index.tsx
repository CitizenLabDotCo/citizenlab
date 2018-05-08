import React from 'react';
import { isNullOrError } from 'utils/helperUtils';

// services
import { IProjectData, reorderProject } from 'services/projects';
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';

// localisation
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import messages from '../messages';

// components
import { SortableList, SortableRow } from 'components/admin/ResourceList';
import PageWrapper, { ButtonWrapper } from 'components/admin/PageWrapper';
import Button from 'components/UI/Button';
import Title from 'components/admin/PageTitle';
import StatusLabel from 'components/UI/StatusLabel';
import HasPermission from 'components/HasPermission';

interface InputProps {}

interface DataProps {
  projects: GetProjectsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class AdminProjectsList extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleReorder = (projectId, newOrder) => {
    reorderProject(projectId, newOrder);
  }

  render () {
    const { projectsList } = this.props.projects;

    if (!isNullOrError(projectsList)) {
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
            <SortableList items={projectsList} onReorder={this.handleReorder}>
              {({ itemsList, handleDragRow, handleDropRow }) => (
                itemsList.map((project: IProjectData, index: number) => (
                  <SortableRow
                    key={project.id}
                    id={project.id}
                    index={index}
                    moveRow={handleDragRow}
                    dropRow={handleDropRow}
                  >
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
                  </SortableRow>
                ))
              )}
            </SortableList>
          </PageWrapper>
        </>
      );
    }

    return null;
  }
}

export default (props) => (
  <GetProjects publicationStatuses={['draft', 'published', 'archived']} filterCanModerate={true}>
    {projects => <AdminProjectsList {...props} projects={projects} />}
  </GetProjects>
);
