// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// Services
import { projectBySlugStream, IProject } from 'services/projects';

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

const StyledGoBackButton = styled(GoBackButton)`
  margin-bottom: 20px;
`;

type Props = {
  params: {
    slug: string | null,
  },
  location: {
    pathname: string
  }
};

type State = {
  project: IProject | null,
  loaded: boolean
};

class AdminProjectEdition extends React.PureComponent<Props & InjectedIntlProps, State> {
  slug$: Rx.BehaviorSubject<string | null>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      project: null,
      loaded: false
    };
    this.slug$ = new Rx.BehaviorSubject(this.props.params.slug || null);
    this.subscriptions = [];
  }

  componentWillMount() {
    this.slug$.next(this.props.params.slug || null);

    this.subscriptions = [
      this.slug$.distinctUntilChanged().switchMap((slug) => {
        return (slug ? projectBySlugStream(slug).observable : Rx.Observable.of(null));
      }).subscribe((project) => {
        this.setState({
          project,
          loaded: true
        });
      })
    ];
  }

  componentWillReceiveProps(newProps) {
    this.slug$.next(newProps.params.slug);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
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
        {
          label: this.props.intl.formatMessage(messages.ideasTab),
          url: `${baseTabsUrl}/ideas`,
        },
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
    const { project, loaded } = this.state;
    const { formatMessage } = this.props.intl;

    if (loaded) {
      const tabbedProps = {
        resource: {
          title: project ? project.data.attributes.title_multiloc : formatMessage(messages.addNewProject),
          publicLink: project ? `/projects/${project.data.attributes.slug}` : ''
        },
        messages: {
          viewPublicResource: messages.viewPublicProject,
        },
        tabs: this.getTabs(),
        location: this.props.location,
      };

      return(
        <>
          <StyledGoBackButton onClick={this.goBack} />

          <TabbedResource {...tabbedProps}>
            {React.cloneElement(this.props.children as React.ReactElement<any>, { project })}
          </TabbedResource>
        </>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(AdminProjectEdition);
