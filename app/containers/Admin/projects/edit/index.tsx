// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// Services
import { projectBySlugStream, IProjectData } from 'services/projects';

// Components
import GoBackButton from 'components/UI/GoBackButton';
import TabbedResource from 'components/admin/TabbedResource';
import { browserHistory } from 'react-router';

// Localisation
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from '../messages';

// style
import styled from 'styled-components';

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

const StyledGoBackButton = styled(GoBackButton)`
  margin-bottom: 20px;
`;

class AdminProjectEdition extends React.PureComponent<Props & InjectedIntlProps, State> {
  subscription: Rx.Subscription;

  constructor(props: Props) {
    super(props as any);

    this.state = {
      project: null,
    };
  }

  updateSubscription (slug) {
    this.subscription = projectBySlugStream(slug).observable.subscribe((project) => {
      this.setState({ project: project ? project.data : null });
    });
  }

  componentDidMount() {
    if (this.props.params.slug) {
      this.updateSubscription(this.props.params.slug);
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

  getTabs = () => {
    if (this.props.params.slug) {
      const baseTabsUrl = `/admin/projects/${this.props.params.slug}`;
      return [
        {
          label: this.props.intl.formatMessage(messages.generalTab),
          url: `${baseTabsUrl}/edit`,
        },
        {
          label: this.props.intl.formatMessage(messages.descriptionTab),
          url: `${baseTabsUrl}/description`,
        },
        // {
        //   label: this.props.intl.formatMessage(messages.ideasTab),
        //   url: `${baseTabsUrl}/ideas`,
        // },
        {
          label: this.props.intl.formatMessage(messages.phasesTab),
          url: `${baseTabsUrl}/timeline`,
        },
        {
          label: this.props.intl.formatMessage(messages.eventsTab),
          url: `${baseTabsUrl}/events`,
        },
        {
          label: this.props.intl.formatMessage(messages.permissionsTab),
          url: `${baseTabsUrl}/permissions`,
          feature: 'private_projects',
        },
      ];
    }

    return [];
  }

  goBack = () => {
    browserHistory.push('/admin/projects');
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
      tabs: this.getTabs(),
      location: this.props.location,
    };

    return(
      <div>
        <StyledGoBackButton onClick={this.goBack} />

        <TabbedResource {...tabbedProps}>
          {React.cloneElement(this.props.children as React.ReactElement<any>, { project })}
        </TabbedResource>
      </div>
    );
  }
}

export default injectIntl(AdminProjectEdition);
