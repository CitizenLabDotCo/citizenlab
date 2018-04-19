import * as React from 'react';
import { sortBy } from 'lodash';
import * as Rx from 'rxjs/Rx';

// style
import styled from 'styled-components';
import { color, fontSize } from 'utils/styleUtils';

// services
import { projectsStream, IProjectData, reorderProject } from 'services/projects';

// localisation
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import messages from '../messages';

// components
import { SortableList, SortableRow } from 'components/admin/ResourceList';
import PageWrapper from 'components/admin/PageWrapper';
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

type Props = {};

type State = {
  projects: IProjectData[] | null;
  loaded: boolean;
};

export default class AdminProjectsList extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      projects: null,
      loaded: false
    };
  }

  componentDidMount() {
    const projects$ = projectsStream({
      queryParameters: {
        publication_statuses: ['draft', 'published', 'archived']
      }
    }).observable;

    this.subscriptions = [
      projects$.subscribe((unsortedProjects) => {
        const projects = sortBy(unsortedProjects.data, (project) => project.attributes.created_at).reverse();
        this.setState({ projects, loaded: true });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleReorder = (projectId, newOrder) => {
    reorderProject(projectId, newOrder);
  }

  render () {
    const { loaded, projects } = this.state;

    if (loaded) {
      return (
        <>
          <Title>
            <FormattedMessage {...messages.overviewPageTitle} />
          </Title>

          <PageWrapper>
            <p>
              <Button linkTo="/admin/projects/new" style="cl-blue" circularCorners={false} icon="plus-circle">
                <FormattedMessage {...messages.addNewProject} />
              </Button>
            </p>
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
