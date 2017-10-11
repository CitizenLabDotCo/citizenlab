// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// Services
import { projectBySlugStream, IProjectData } from 'services/projects';

// Components
import TabbedResource from 'components/admin/TabbedResource';
import { Link } from 'react-router';


// Localisation
import { FormattedMessage } from 'react-intl';
import t from 'components/T';
const T = t;
import messages from '../messages';

// Component typing
type Props = {
  params: {
    slug: string | null,
  },
  location: {
    pathname: string
  }
};

type State = {
  project: IProjectData | null,
};

export default class AdminProjectEdition extends React.PureComponent<Props, State> {
  subscription: Rx.Subscription;
  tabs: any[];

  constructor() {
    super();

    this.state = {
      project: null,
    };
  }

  updateSubscription (slug) {
    this.subscription = projectBySlugStream(slug).observable.subscribe((project) => {
      this.setState({ project: project.data });
    });
  }

  componentDidMount() {
    if (this.props.params.slug) {
      this.updateSubscription(this.props.params.slug);

      const baseTabsUrl = `/admin/projects/${this.props.params.slug}`;
      const isActive = (url) => {
        return this.props.location.pathname === url;
      };

      this.tabs = [
        {
          label: 'general',
          url: `${baseTabsUrl}/edit`
        },
        {
          label: 'timeline',
          url: `${baseTabsUrl}/timeline`
        },
        {
          label: 'events',
          url: `${baseTabsUrl}/events`
        },
        {
          label: 'permissions',
          url: `${baseTabsUrl}/permissions`
        },
      ];
    }
  }

  componentWillReceiveProps(newProps) {
    // Update subscription if the slug changes
    // This happens when transitioning from New to Edit view after saving a new project
    if (newProps.params.slug && newProps.params.slug !== this.props.params.slug) {
      this.updateSubscription(newProps.params.slug);
    }
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  render() {
    const { project } = this.state;

    const tabbedProps = {
      resource: {
        title: project ? project.attributes.title_multiloc : '',
        publicLink: project ? `/projects/${project.attributes.slug}` : ''
      },
      messages: {
        viewPublicResource: messages.viewPublicProject,
      },
      tabs: this.tabs,
      location: this.props.location,
    };

    return(
      <div>
        <Link to="/admin/projects">
          <FormattedMessage {...messages.goBack} />
        </Link>
        <TabbedResource {...tabbedProps}>
          {React.cloneElement(this.props.children as React.ReactElement<any>, { project })}
        </TabbedResource>
      </div>
    );
  }
}
