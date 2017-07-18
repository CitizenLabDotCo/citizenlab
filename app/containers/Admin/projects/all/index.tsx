// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// Services
import { observeProjects, IProjectData } from 'services/projects';

// Localisation
import { FormattedMessage } from 'react-intl';
import t from 'utils/containers/t';
const T = t;
import messages from '../messages';

// Component typing
type Props = {
  projects: IProjectData[]
};

type State = {
  projects: IProjectData[] | null;
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
      console.log(projects);
      this.setState({ projects: projects.data });
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render () {
    const { projects } = this.state;

    return (
      <ul>
        {projects && projects.map((project) => (
          <li key={project.id}>
            <T value={project.attributes.title_multiloc} />

            <a href={`/admin/projects/${project.attributes.slug}/edit`}>
              <FormattedMessage {...messages.editProject} />
            </a>
          </li>
        ))}
      </ul>
    );
  }
}

export default AdminProjectsList;
