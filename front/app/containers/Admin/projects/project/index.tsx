import React, { PureComponent } from 'react';
import { reject, some } from 'lodash-es';
import clHistory from 'utils/cl-router/history';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { Outlet as RouterOutlet } from 'react-router-dom';

// components
import GoBackButton from 'components/UI/GoBackButton';
import Button from 'components/UI/Button';
import TabbedResource from 'components/admin/TabbedResource';
import Outlet from 'components/Outlet';
import { Box } from '@citizenlab/cl2-component-library';
import NewIdeaButton from './ideas/NewIdeaButton';
import NewIdeaButtonDropdown from './ideas/NewIdeaButtonDropdown';

// resources
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import { PreviousPathnameContext } from 'context';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import messages from './messages';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';

// typings
import { InsertConfigurationOptions, ITab } from 'typings';
import { getInputTerm } from 'services/participationContexts';
import { IProjectData } from 'api/projects/types';

// utils
import { insertConfiguration } from 'utils/moduleUtils';
import {
  getAllParticipationMethods,
  getMethodConfig,
  showInputManager,
} from 'utils/configs/participationMethodConfig';

const TopContainer = styled.div`
  width: 100%;
  margin-top: -5px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;

const ActionsContainer = styled.div`
  display: flex;
  & > *:not(:last-child) {
    margin-right: 15px;
  }
`;

export interface InputProps {}

interface DataProps {
  surveys_enabled: GetFeatureFlagChildProps;
  typeform_enabled: GetFeatureFlagChildProps;
  phases: GetPhasesChildProps;
  project: GetProjectChildProps;
  previousPathName: string | null;
}

interface State {
  showIdeaDropdown: boolean;
  tabs: ITab[];
  goBackUrl: string | null;
  tabHideConditions: {
    [tabName: string]: (
      project: IProjectData,
      phases: GetPhasesChildProps
    ) => boolean;
  };
}

interface Props extends InputProps, DataProps {}

export class AdminProjectsProjectIndex extends PureComponent<
  Props & WrappedComponentProps & InjectedLocalized & WithRouterProps,
  State
> {
  constructor(
    props: Props & WrappedComponentProps & InjectedLocalized & WithRouterProps
  ) {
    super(props);
    const {
      intl: { formatMessage },
    } = props;

    this.state = {
      showIdeaDropdown: false,
      tabs: [
        {
          label: formatMessage(messages.generalTab),
          url: '',
          name: 'general',
        },
        {
          label: formatMessage(messages.descriptionTab),
          url: 'description',
          name: 'description',
        },
        {
          label: formatMessage(messages.inputManagerTab),
          url: 'ideas',
          name: 'ideas',
        },
        {
          label: formatMessage(messages.inputFormTab),
          url: 'ideaform',
          name: 'ideaform',
        },
        {
          label: formatMessage(messages.pollTab),
          url: 'poll',
          feature: 'polls',
          name: 'poll',
        },
        {
          label: formatMessage(messages.surveyTab),
          url: 'native-survey',
          name: 'survey',
          active: (url: string) =>
            url.endsWith('native-survey') ||
            url.endsWith('native-survey/results'),
        },
        {
          label: formatMessage(messages.surveyResultsTab),
          url: 'survey-results',
          name: 'survey-results',
        },
        {
          label: formatMessage(messages.allowedInputTopicsTab),
          name: 'topics',
          url: 'allowed-input-topics',
        },
        {
          label: formatMessage(messages.phasesTab),
          url: 'timeline',
          name: 'phases',
        },
        {
          label: formatMessage(messages.volunteeringTab),
          url: 'volunteering',
          feature: 'volunteering',
          name: 'volunteering',
        },
        {
          label: formatMessage(messages.eventsTab),
          url: 'events',
          name: 'events',
        },
        {
          label: formatMessage(messages.permissionsTab),
          url: `permissions`,
          feature: 'private_projects',
          name: 'permissions',
        },
      ],
      tabHideConditions: {
        general: function isGeneralTabHidden() {
          return false;
        },
        description: function isDescriptionTabHidden() {
          return false;
        },
        ideas: function isIdeaTabHidden(project, phases) {
          return !showInputManager(project, phases);
        },
        ideaform: function isIdeaFormTabHidden(project, phases) {
          const allParticipationMethods = getAllParticipationMethods(
            project,
            phases || null
          );
          return !some(
            allParticipationMethods,
            (method) =>
              getMethodConfig(method).formEditor === 'simpleFormEditor'
          );
        },
        poll: function isPollTabHidden(project, phases) {
          const processType = project?.attributes.process_type;
          const participationMethod = project.attributes.participation_method;

          if (
            (processType === 'continuous' && participationMethod !== 'poll') ||
            (processType === 'timeline' &&
              phases &&
              phases.filter((phase) => {
                return phase.attributes.participation_method === 'poll';
              }).length === 0)
          ) {
            return true;
          }

          return false;
        },
        survey: function isSurveyTabHidden(project, phases) {
          const processType = project.attributes.process_type;
          const participationMethod = project.attributes.participation_method;
          const noNativeSurveyInTimeline =
            phases &&
            !phases.some(
              (phase) =>
                phase.attributes.participation_method === 'native_survey'
            );

          // Hide tab when participation method is not native survey in timeline and continuous process types
          const hideTab =
            (processType === 'continuous' &&
              participationMethod !== 'native_survey') ||
            (processType === 'timeline' && phases && noNativeSurveyInTimeline);

          if (hideTab) {
            return true;
          }
          return false;
        },
        'survey-results': function surveyResultsTabHidden(project, phases) {
          const { typeform_enabled, surveys_enabled } = props;

          const processType = project?.attributes.process_type;
          const participationMethod = project.attributes.participation_method;

          if (
            (participationMethod !== 'survey' &&
              processType === 'continuous') ||
            !surveys_enabled ||
            !typeform_enabled ||
            (surveys_enabled &&
              typeform_enabled &&
              processType === 'continuous' &&
              participationMethod === 'survey' &&
              project.attributes.survey_service !== 'typeform') ||
            (processType === 'timeline' &&
              phases &&
              phases.filter((phase) => {
                return (
                  phase.attributes.participation_method === 'survey' &&
                  phase.attributes.survey_service === 'typeform'
                );
              }).length === 0)
          ) {
            return true;
          }

          return false;
        },
        topics: function topicsTabHidden(project, phases) {
          const processType = project.attributes.process_type;
          const participationMethod = project.attributes.participation_method;
          const hideTab =
            (processType === 'continuous' &&
              participationMethod !== 'ideation' &&
              participationMethod !== 'voting') ||
            (processType === 'timeline' &&
              phases &&
              phases.filter((phase) => {
                return (
                  phase.attributes.participation_method === 'ideation' ||
                  phase.attributes.participation_method === 'voting'
                );
              }).length === 0);

          if (hideTab) {
            return true;
          }
          return false;
        },
        phases: function isPhasesTabHidden(project) {
          const processType = project?.attributes.process_type;

          if (processType !== 'timeline') {
            return true;
          }

          return false;
        },
        volunteering: function isVolunteeringTabHidden(project, phases) {
          const processType = project?.attributes.process_type;
          const participationMethod = project.attributes.participation_method;

          if (
            (processType === 'continuous' &&
              participationMethod !== 'volunteering') ||
            (processType === 'timeline' &&
              phases &&
              phases.filter((phase) => {
                return phase.attributes.participation_method === 'volunteering';
              }).length === 0)
          ) {
            return true;
          }

          return false;
        },
        events: function isEventsTabHidden() {
          return false;
        },
      },
      goBackUrl: null,
    };
  }

  componentDidMount() {
    this.setState({
      goBackUrl: this.props.previousPathName,
    });
  }

  getTabs = (projectId: string, project: IProjectData) => {
    const { tabs, tabHideConditions } = this.state;
    const { phases } = this.props;
    const baseTabsUrl = `/admin/projects/${projectId}`;

    const tabNames = tabs.map((tab) => tab.name);
    let cleanedTabs = tabs;

    tabNames.forEach((tabName) => {
      if (
        tabName &&
        tabHideConditions[tabName] &&
        tabHideConditions[tabName](project, phases)
      ) {
        cleanedTabs = reject(cleanedTabs, { name: tabName });
      }
    });

    return cleanedTabs.map((tab) => {
      // the "general" tab url is an empty string, so we don't want to add
      // a slash to the end of the URL
      const url =
        tab.url === '' ? `${baseTabsUrl}` : `${baseTabsUrl}/${tab.url}`;
      return {
        ...tab,
        url,
      };
    });
  };

  goBack = () => {
    clHistory.push(`/admin/projects/`);
  };

  onNewIdea = (pathname: string) => (_event) => {
    trackEventByName(tracks.clickNewIdea.name, {
      extra: { pathnameFrom: pathname },
    });
  };

  handleData = (insertTabOptions: InsertConfigurationOptions<ITab>) => {
    this.setState(({ tabs }) => ({
      tabs: insertConfiguration(insertTabOptions)(tabs),
    }));
  };

  render() {
    const {
      project,
      phases,
      intl: { formatMessage },
      localize,
      location: { pathname },
    } = this.props;

    const tabbedProps = {
      resource: {
        title: !isNilOrError(project)
          ? localize(project.attributes.title_multiloc)
          : formatMessage(messages.newProject),
      },
      tabs: !isNilOrError(project) ? this.getTabs(project.id, project) : [],
    };

    let numberIdeationPhases = 0;
    let ideationPhase;

    if (!isNilOrError(project) && phases !== undefined) {
      const inputTerm = getInputTerm(
        project?.attributes.process_type,
        project,
        phases
      );

      if (phases) {
        phases.map((phase) => {
          if (
            getMethodConfig(phase.attributes.participation_method)
              .showInputManager
          ) {
            numberIdeationPhases++;
            ideationPhase = phase;
          }
        });
      }

      const showDropdownButton =
        project.attributes.process_type === 'timeline' &&
        numberIdeationPhases > 1;
      const hasIdeasTab = tabbedProps.tabs.some((tab) => tab.name === 'ideas');

      return (
        <>
          <Outlet
            id="app.containers.Admin.projects.edit"
            onData={this.handleData}
            project={project}
            phases={phases}
          />

          <TopContainer>
            <GoBackButton onClick={this.goBack} />
            <ActionsContainer>
              {hasIdeasTab && (
                <>
                  <Box
                    onClick={this.onNewIdea(pathname)}
                    onMouseOver={() => {
                      if (showDropdownButton) {
                        this.setState({ showIdeaDropdown: true });
                      }
                    }}
                    onMouseLeave={() => {
                      if (showDropdownButton) {
                        this.setState({ showIdeaDropdown: false });
                      }
                    }}
                  >
                    {project.attributes.process_type === 'continuous' && (
                      <NewIdeaButton
                        inputTerm={inputTerm}
                        linkTo={`/projects/${project.attributes.slug}/ideas/new`}
                      />
                    )}
                    {project.attributes.process_type === 'timeline' &&
                      numberIdeationPhases === 1 && (
                        <NewIdeaButton
                          inputTerm={ideationPhase.attributes.input_term}
                          linkTo={`/projects/${project.attributes.slug}/ideas/new?phase_id=${ideationPhase.id}`}
                        />
                      )}
                    {showDropdownButton && (
                      <NewIdeaButtonDropdown
                        phases={phases}
                        project={project}
                        showDropdown={this.state.showIdeaDropdown}
                      />
                    )}
                  </Box>
                </>
              )}
              <Button
                buttonStyle="cl-blue"
                icon="eye"
                id="to-project"
                linkTo={`/projects/${project.attributes.slug}`}
              >
                <FormattedMessage {...messages.viewPublicProject} />
              </Button>
            </ActionsContainer>
          </TopContainer>
          <TabbedResource {...tabbedProps}>
            <RouterOutlet />
          </TabbedResource>
        </>
      );
    }

    return null;
  }
}

const AdminProjectEditIndexWithHoCs = injectIntl(
  injectLocalize(AdminProjectsProjectIndex)
);

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  surveys_enabled: <GetFeatureFlag name="surveys" />,
  typeform_enabled: <GetFeatureFlag name="typeform_surveys" />,
  phases: ({ params, render }) => (
    <GetPhases projectId={params.projectId}>{render}</GetPhases>
  ),
  project: ({ params, render }) => (
    <GetProject projectId={params.projectId}>{render}</GetProject>
  ),
  previousPathName: ({ render }) => (
    <PreviousPathnameContext.Consumer>
      {render as any}
    </PreviousPathnameContext.Consumer>
  ),
});

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <AdminProjectEditIndexWithHoCs {...inputProps} {...dataProps} />
    )}
  </Data>
));
