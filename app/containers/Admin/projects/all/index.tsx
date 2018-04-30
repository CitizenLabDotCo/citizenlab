import React from 'react';

// services
import { IProjectData, reorderProject } from 'services/projects';
import GetProjects from 'resources/GetProjects';

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

export interface Props {
  projects: IProjectData[];
}

export interface State {}

class AdminProjectsList extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  handleReorder = (projectId, newOrder) => {
    reorderProject(projectId, newOrder);
  }

  render () {
    const { projects } = this.props;

    if (projects) {
      return (
        <>
          <Title>
            <FormattedMessage {...messages.overviewPageTitle} />
          </Title>

          <PageWrapper>
            <ButtonWrapper>
              <Button className="e2e-admin-add-project" linkTo="/admin/projects/new" style="cl-blue" circularCorners={false} icon="plus-circle">
                <FormattedMessage {...messages.addNewProject} />
              </Button>
            </ButtonWrapper>
            <SortableList items={projects} onReorder={this.handleReorder} className="e2e-admin-projects-list">
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
  <GetProjects publicationStatuses={['draft', 'published', 'archived']}>
    {({ projectsList }) => (
      projectsList && <AdminProjectsList {...props} projects={projectsList} />
    )}
  </GetProjects>
);
