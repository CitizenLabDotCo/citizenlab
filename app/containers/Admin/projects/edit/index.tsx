// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// Services
import { observeProject, IProjectData } from 'services/projects';

// Components
import TabbedResource from 'components/admin/TabbedResource';

// Localisation
import { FormattedMessage } from 'react-intl';
import t from 'utils/containers/t';
const T = t;
import messages from '../messages';

// Component typing
type Props = {
};

type State = {
  project: IProjectData | null,
};

export default class AdminProjectEdition extends React.Component<Props, State> {
  subscription: Rx.Subscription;

  constructor() {
    super();

    this.state = {
      project: null,
    };
  }

  componentDidMount() {
    this.subscription = observeProject('5eb0322c-d6ac-4100-b50e-354f13b119d1').observable.subscribe((project) => {
      this.setState({ project: project.data });
    });

  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    const { project } = this.state;

    const tabbedProps = {
      resource: {
        title: project ? project.attributes.title_multiloc : '',
        publicLink: project ? `/projects/${project.id}` : ''
      },
      messages: {
        viewPublicResource: messages.viewPublicProject,
      },
      tabs: [
        {
          label: 'general',
          url: project ? `/admin/projects/${project.attributes.slug}/edit` : '',
          active: true,
        },
        {
          label: 'timeline',
          url: project ? `/admin/projects/${project.attributes.slug}/timeline` : '',
        },
      ],
    };

    return(
      <div>
        <a href="">go back</a>
        {project &&
          <TabbedResource {...tabbedProps}>
            {this.props.children}
          </TabbedResource>
        }
      </div>
    );
  }
}
