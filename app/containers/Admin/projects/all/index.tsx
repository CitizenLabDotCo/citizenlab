import React from 'react';
import * as Rx from 'rxjs/Rx';

// style
import styled from 'styled-components';
import { color, fontSize } from 'utils/styleUtils';

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

const Title = styled.h1`
  color: ${color('title')};
  font-size: ${fontSize('xxxl')};
  line-height: 40px;
  font-weight: 600;
  padding: 0;
  margin: 0;
  margin-bottom: 30px;
`;

export interface Props {
  projects: IProjectData[];
}

export interface State {}

class AdminProjectsList extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);
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
              <Button linkTo="/admin/projects/new" style="cl-blue" circularCorners={false} icon="plus-circle">
                <FormattedMessage {...messages.addNewProject} />
              </Button>
            </ButtonWrapper>
            <SortableList items={projects} onReorder={this.handleReorder}>
              {({ itemsList, handleDragRow, handleDropRow }) => (
                itemsList.map((project, index) => (
                  <SortableRow
                    key={project.id}
                    id={project.id}
                    index={index}
                    moveRow={handleDragRow}
                    dropRow={handleDropRow}
                  >
                    <div className="expand primary">
                      <T value={project.attributes.title_multiloc} />
                    </div>
                    <Button linkTo={`/admin/projects/${project.id}/edit`} style="secondary" circularCorners={false} icon="edit">
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
