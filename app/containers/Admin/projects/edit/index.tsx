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
  margin-top: 5px;
  margin-bottom: 30px;
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

  getTabs = (slug: string, project: IProjectData) => {
    const baseTabsUrl = `/admin/projects/${slug}`;

    const tabs = [
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
        label: this.props.intl.formatMessage(messages.eventsTab),
        url: `${baseTabsUrl}/events`,
      },
      {
        label: this.props.intl.formatMessage(messages.permissionsTab),
        url: `${baseTabsUrl}/permissions`,
        feature: 'private_projects',
      },
    ];

    if (project.attributes.process_type === 'timeline') {
      tabs.splice(3, 0, {
        label: this.props.intl.formatMessage(messages.phasesTab),
        url: `${baseTabsUrl}/timeline`,
      });
    }

    return tabs;
  }

  goBack = () => {
    const currentLocation = browserHistory.getCurrentLocation();
    const currentPath = currentLocation.pathname;
    const lastUrlSegment = currentPath.substr(currentPath.lastIndexOf('/') + 1);
    const newPath = currentPath.replace(lastUrlSegment, '').replace(/\/$/, '');
    const newLastUrlSegment = newPath.substr(newPath.lastIndexOf('/') + 1);

    if (newLastUrlSegment === this.props.params.slug) {
      browserHistory.push('/admin/projects');
    } else {
      browserHistory.push(newPath);
    }
  }

  render() {
    const { location } = this.props;
    const { slug } = this.props.params;
    const { project, loaded } = this.state;
    const { formatMessage } = this.props.intl;

    if (loaded) {
      const { children } = this.props;
      const childrenWithExtraProps = React.cloneElement(children as React.ReactElement<any>, { project });
      const tabbedProps = {
        location,
        resource: {
          title: project ? project.attributes.title_multiloc : formatMessage(messages.addNewProject),
          publicLink: project ? `/projects/${project.attributes.slug}` : ''
        },
        messages: {
          viewPublicResource: messages.viewPublicProject,
        },
        tabs: ((slug && project) ? this.getTabs(slug, project) : [])
      };

      return(
        <>
          <StyledGoBackButton onClick={this.goBack} />
          <TabbedResource {...tabbedProps}>
            {childrenWithExtraProps}
          </TabbedResource>
        </>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(AdminProjectEdition);
