// Libraries
import React from 'react';
import { Subscription, BehaviorSubject, of } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { isString, reject } from 'lodash-es';

// Services
import { projectByIdStream, IProjectData } from 'services/projects';

// Components
import GoBackButton from 'components/UI/GoBackButton';
import Button from 'components/UI/Button';
import TabbedResource, { TabProps } from 'components/admin/TabbedResource';
import clHistory from 'utils/cl-router/history';

// Localisation
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// tracks
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import { adopt } from 'react-adopt';
import GetFeatureFlag from 'resources/GetFeatureFlag';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import { isNilOrError } from 'utils/helperUtils';

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-end;
  position: absolute;
  top: 50px;
  right: 0;

  & > *:not(:last-child) {
    margin-right: 15px;
  }
`;

const TopContainer = styled.div`
  width: 100%;
  margin-bottom: 30px;
  position: relative;
`;

interface DataProps {
  surveys_enabled: boolean | null;
  typeform_enabled: boolean | null;
  google_forms_enabled: boolean | null;
  survey_monkey_enabled: boolean | null;
  phases: GetPhasesChildProps;
}

type InputProps = {
  params: {
    projectId: string | null,
  },
  location: {
    pathname: string
  }
};

interface ITracks {
  clickNewIdea: ({ extra: object }) => void;
}

type State = {
  project: IProjectData | null,
  loaded: boolean
};

interface Props extends InputProps, DataProps { }

class AdminProjectEdition extends React.PureComponent<Props & InjectedIntlProps & ITracks, State> {
  projectId$: BehaviorSubject<string | null>;
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      project: null,
      loaded: false
    };
    this.projectId$ = new BehaviorSubject(null);
    this.subscriptions = [];
  }

  componentDidMount() {
    this.projectId$.next(this.props.params.projectId);

    this.subscriptions = [
      this.projectId$.pipe(
        distinctUntilChanged(),
        switchMap(projectId => isString(projectId) ? projectByIdStream(projectId).observable : of(null))
      ).subscribe((project) => {
        this.setState({
          project: (project ? project.data : null),
          loaded: true
        });
      })
    ];
  }

  componentDidUpdate() {
    this.projectId$.next(this.props.params.projectId);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getTabs = (projectId: string, project: IProjectData) => {
    const baseTabsUrl = `/admin/projects/${projectId}`;
    const { formatMessage } = this.props.intl;
    const { typeform_enabled, surveys_enabled, phases } = this.props;

    let tabs: TabProps[] = [
      {
        label: formatMessage(messages.generalTab),
        url: `${baseTabsUrl}/edit`,
        className: 'general',
      },
      {
        label: formatMessage(messages.descriptionTab),
        url: `${baseTabsUrl}/description`,
        className: 'description',
      },
      {
        label: formatMessage(messages.ideasTab),
        url: `${baseTabsUrl}/ideas`,
        className: 'ideas',
      },
      {
        label: formatMessage(messages.eventsTab),
        url: `${baseTabsUrl}/events`,
        className: 'events',
      },
      {
        label: formatMessage(messages.permissionsTab),
        url: `${baseTabsUrl}/permissions`,
        feature: 'private_projects',
        className: 'permissions',
      },
    ];

    if (project.attributes.process_type === 'continuous' && project.attributes.participation_method !== 'ideation' && project.attributes.participation_method !== 'budgeting') {
      tabs = reject(tabs, { className: 'ideas' });
    }

    if (project.attributes.process_type === 'timeline') {
      tabs.splice(3, 0, {
        label: formatMessage(messages.phasesTab),
        url: `${baseTabsUrl}/timeline`,
        className: 'phases',
      });
    }

    if (surveys_enabled && typeform_enabled) {
      if (
        (project.attributes.process_type === 'continuous'
          && project.attributes.participation_method === 'survey'
          && project.attributes.survey_service === 'typeform'
        ) || (project.attributes.process_type === 'timeline'
          && !isNilOrError(phases) && phases.filter(phase => phase.attributes.participation_method === 'survey' && phase.attributes.survey_service === 'typeform').length > 0
        )) {
        tabs.splice(3, 0, {
          label: formatMessage(messages.surveyResultsTab),
          url: `${baseTabsUrl}/survey-results`,
          className: 'survey-results'
        });
      }
    }

    return tabs;
  }

  goBack = () => {
    const currentPath = location.pathname;
    const lastUrlSegment = currentPath.substr(currentPath.lastIndexOf('/') + 1);
    const newPath = currentPath.replace(lastUrlSegment, '').replace(/\/$/, '');
    const newLastUrlSegment = newPath.substr(newPath.lastIndexOf('/') + 1);

    if (newLastUrlSegment === this.props.params.projectId) {
      clHistory.push('/admin/projects');
    } else {
      clHistory.push(newPath);
    }
  }

  onNewIdea = (pathname) => (_event) => {
    this.props.clickNewIdea({ extra: { pathnameFrom: pathname } });
  }

  render() {
    const { projectId } = this.props.params;
    const { project, loaded } = this.state;
    const { formatMessage } = this.props.intl;

    if (loaded) {
      const { children, location: { pathname } } = this.props;
      const childrenWithExtraProps = React.cloneElement(children as React.ReactElement<any>, { project });
      const tabbedProps = {
        resource: {
          title: project ? project.attributes.title_multiloc : formatMessage(messages.addNewProject),
        },
        tabs: ((projectId && project) ? this.getTabs(projectId, project) : [])
      };
      return (
        <>
          <TopContainer>
            <GoBackButton onClick={this.goBack} />
            <ActionsContainer>
              {/^.*\/ideas$/.test(pathname) &&
                <Button
                  linkTo={projectId ? `/projects/${projectId}/ideas/new` : '/ideas/new'}
                  text={formatMessage(messages.addNewIdea)}
                  onClick={this.onNewIdea(pathname)}
                />
              }
              <Button
                style="cl-blue"
                icon="eye"
                linkTo={project ? `/projects/${project.attributes.slug}` : ''}
                circularCorners={false}
              >
                <FormattedMessage {...messages.viewPublicProject} />
              </Button>
            </ActionsContainer>
          </TopContainer>
          <TabbedResource {...tabbedProps}>
            {childrenWithExtraProps}
          </TabbedResource>
        </>
      );
    }

    return null;
  }
}

const AdminProjectEditionWithHoCs = injectTracks<Props>(tracks)(injectIntl<Props & ITracks>(AdminProjectEdition));

const Data = adopt<DataProps, InputProps>({
  surveys_enabled: <GetFeatureFlag name="surveys" />,
  typeform_enabled: <GetFeatureFlag name="typeform_surveys" />,
  phases: ({ params, render }) => <GetPhases projectId={params.projectId} >{render}</GetPhases>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <AdminProjectEditionWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
