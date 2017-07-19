// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import styledComponents from 'styled-components';
const styled = styledComponents;

// Services
import { observeProjects, IProjectData } from 'services/projects';

// Localisation
import { FormattedMessage } from 'react-intl';
import t from 'utils/containers/t';
const T = t;
import messages from '../messages';

// Styles
const ProjectsList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  list-style: none;
`;

const ProjectCard = styled.li`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 1rem;

  h1 {
    text-align: center;
  }

  a {
    display: block;
    text-align: center;
  }
`;

// Component typing
type Props = {
  projects: IProjectData[]
};

type State = {
  projects: IProjectData[] | null
};

class AdminProjectsList extends React.Component<Props, State> {
  subscription: Rx.Subscription;

  constructor () {
    super();

    this.state = {
      projects: null,
    };
  }

  componentDidMount() {
    this.subscription = observeProjects().observable.subscribe((projects) => {
      this.setState({ projects: projects.data });
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render () {
    const { projects } = this.state;

    return (
      <ProjectsList>
        {projects && projects.map((project) => (
          <ProjectCard key={project.id}>
            <h1><T value={project.attributes.title_multiloc} /></h1>

            <a href={`/admin/projects/${project.attributes.slug}/edit`}>
              <FormattedMessage {...messages.editProject} />
            </a>
          </ProjectCard>
        ))}
      </ProjectsList>
    );
  }
}

export default AdminProjectsList;
