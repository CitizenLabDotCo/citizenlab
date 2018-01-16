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
  project: IProjectData | null,
  loaded: boolean
};

class AdminProjectEdition extends React.PureComponent<Props & InjectedIntlProps, State> {
  props$: Rx.BehaviorSubject<Props>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      project: null,
      loaded: false
    };
    this.props$ = new Rx.BehaviorSubject(null as any);
    this.subscriptions = [];
  }

  componentWillMount() {
    this.props$.next(this.props);

    this.subscriptions = [
      this.props$.distinctUntilChanged().switchMap((props) => {
        return (props.params && props.params.slug ? projectBySlugStream(props.params.slug).observable : Rx.Observable.of(null));
      }).subscribe((project) => {
        this.setState({
          project: (project ? project.data : null),
          loaded: true
        });
      })
    ];
  }

  componentWillReceiveProps(nextProps) {
    this.props$.next(nextProps);
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
          title: project ? project.attributes.title_multiloc : formatMessage(messages.addNewProject),
          publicLink: project ? `/projects/${project.attributes.slug}` : ''
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
