import React, { PureComponent } from 'react';
import { reject } from 'lodash-es';
import clHistory from 'utils/cl-router/history';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// components
import GoBackButton from 'components/UI/GoBackButton';
import Button from 'components/UI/Button';
import TabbedResource from 'components/admin/TabbedResource';

// resources
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import { PreviousPathnameContext } from 'context';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import messages from './messages';
import { getInputTermMessage } from 'utils/i18n';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';

// typings
// services
import { getInputTerm } from 'services/participationContexts';
import { IProjectData } from 'services/projects';

import Outlet from 'components/Outlet';
import { InsertTabOptions, ITab } from 'typings';
import { insertTab } from 'utils/moduleUtils';

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

interface ITracks {
  clickNewIdea: ({ extra: object }) => void;
}

export interface InputProps {}

interface DataProps {
  surveys_enabled: boolean | null;
  typeform_enabled: boolean | null;
  customTopicsEnabled: GetFeatureFlagChildProps;
  phases: GetPhasesChildProps;
  project: GetProjectChildProps;
  projectVisibilityEnabled: GetFeatureFlagChildProps;
  granularPermissionsEnabled: GetFeatureFlagChildProps;
  projectManagementEnabled: GetFeatureFlagChildProps;
  ideaAssignmentEnabled: GetFeatureFlagChildProps;
  previousPathName: string | null;
}

interface State {
  tabs: ITab[];
  goBackUrl: string | null;
}

interface Props extends InputProps, DataProps {}

export class AdminProjectEdition extends PureComponent<
  Props & InjectedIntlProps & InjectedLocalized & WithRouterProps & ITracks,
  State
> {
  constructor(props) {
    super(props);
    const {
      intl: { formatMessage },
    } = props;

    this.state = {
      tabs: [
        {
          label: formatMessage(messages.generalTab),
          url: `edit`,
          name: 'general',
        },
        {
          label: formatMessage(messages.descriptionTab),
          url: `description`,
          name: 'description',
        },
        {
          label: formatMessage(messages.inputManagerTab),
          url: `ideas`,
          name: 'ideas',
        },
        {
          label: formatMessage(messages.pollTab),
          url: `poll`,
          feature: 'polls',
          name: 'poll',
        },
        {
          label: formatMessage(messages.surveyResultsTab),
          url: `survey-results`,
          name: 'survey-results',
        },
        {
          label: formatMessage(messages.phasesTab),
          url: `timeline`,
          name: 'phases',
        },
        {
          label: formatMessage(messages.topicsTab),
          url: `topics`,
          name: 'topics',
        },
        {
          label: formatMessage(messages.volunteeringTab),
          url: `volunteering`,
          feature: 'volunteering',
          name: 'volunteering',
        },
        {
          label: formatMessage(messages.eventsTab),
          url: `events`,
          name: 'events',
        },
        {
          label: formatMessage(messages.permissionsTab),
          url: `permissions`,
          feature: 'private_projects',
          name: 'permissions',
        },
      ],
      goBackUrl: null,
    };
  }

  componentDidMount() {
    this.setState({
      goBackUrl: this.props.previousPathName,
    });
  }

  getTabs = (projectId: string, project: IProjectData) => {
    const { tabs } = this.state;
    const baseTabsUrl = `/admin/projects/${projectId}`;

    const {
      typeform_enabled,
      surveys_enabled,
      phases,
      customTopicsEnabled,
      projectVisibilityEnabled,
      granularPermissionsEnabled,
      projectManagementEnabled,
      ideaAssignmentEnabled,
    } = this.props;
    const processType = project.attributes.process_type;
    const participationMethod = project.attributes.participation_method;

    const tabHideConditions = {
      general: function isGeneralTabHidden() {
        return false;
      },
      description: function isDescriptionTabHidden() {
        return false;
      },
      ideas: function isIdeaTabHidden() {
        if (
          processType === 'continuous' &&
          participationMethod !== 'ideation' &&
          participationMethod !== 'budgeting'
        ) {
          return true;
        }

        return false;
      },
      poll: function isPollTabHidden() {
        if (
          (processType === 'continuous' && participationMethod !== 'poll') ||
          (processType === 'timeline' &&
            !isNilOrError(phases) &&
            phases.filter((phase) => {
              return phase.attributes.participation_method === 'poll';
            }).length === 0)
        ) {
          return true;
        }

        return false;
      },
      'survey-results': function surveyResultsTabHidden() {
        if (
          (participationMethod !== 'survey' && processType === 'continuous') ||
          !surveys_enabled ||
          !typeform_enabled ||
          (surveys_enabled &&
            typeform_enabled &&
            processType === 'continuous' &&
            participationMethod === 'survey' &&
            project.attributes.survey_service !== 'typeform') ||
          (processType === 'timeline' &&
            !isNilOrError(phases) &&
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
      ideaform: function isIdeaformTabHidden() {
        if (
          (processType === 'continuous' &&
            participationMethod !== 'ideation' &&
            participationMethod !== 'budgeting') ||
          (processType === 'timeline' &&
            !isNilOrError(phases) &&
            phases.filter((phase) => {
              return (
                phase.attributes.participation_method === 'ideation' ||
                phase.attributes.participation_method === 'budgeting'
              );
            }).length === 0)
        ) {
          return true;
        }

        return false;
      },
      phases: function isPhasesTabHidden() {
        if (processType !== 'timeline') {
          return true;
        }

        return false;
      },
      topics: function isTopicsTabHidden() {
        if (
          !customTopicsEnabled ||
          (processType === 'continuous' &&
            participationMethod !== 'ideation' &&
            participationMethod !== 'budgeting') ||
          (processType === 'timeline' &&
            !isNilOrError(phases) &&
            phases.filter((phase) => {
              return (
                phase.attributes.participation_method === 'ideation' ||
                phase.attributes.participation_method === 'budgeting'
              );
            }).length === 0)
        ) {
          return true;
        }

        return false;
      },
      volunteering: function isVolunteeringTabHidden() {
        if (
          (processType === 'continuous' &&
            participationMethod !== 'volunteering') ||
          (processType === 'timeline' &&
            !isNilOrError(phases) &&
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
      permissions: function isPermissionsTabHidden() {
        if (
          !projectVisibilityEnabled &&
          !granularPermissionsEnabled &&
          !projectManagementEnabled &&
          !ideaAssignmentEnabled
        ) {
          return true;
        }

        return false;
      },
    };

    const tabNames = tabs.map((tab) => tab.name);
    let cleanedTabs = tabs;

    tabNames.forEach((tabName) => {
      if (tabName && tabHideConditions[tabName]()) {
        cleanedTabs = reject(cleanedTabs, { name: tabName });
      }
    });

    return cleanedTabs.map((tab) => ({
      ...tab,
      url: `${baseTabsUrl}/${tab.url}`,
    }));
  };

  goBack = () => {
    const backUrl =
      this.state.goBackUrl &&
      this.state.goBackUrl !== this.props.location.pathname
        ? this.state.goBackUrl
        : '/admin/projects';

    clHistory.push(backUrl);
  };

  onNewIdea = (pathname: string) => (_event) => {
    trackEventByName(tracks.clickNewIdea.name, {
      extra: { pathnameFrom: pathname },
    });
  };

  handleData = (insertTabOptions: InsertTabOptions) => {
    this.setState(({ tabs }) => ({
      tabs: insertTab(insertTabOptions)(tabs),
    }));
  };

  render() {
    const {
      project,
      phases,
      intl: { formatMessage },
      localize,
      children,
      location: { pathname },
    } = this.props;
    const childrenWithExtraProps = React.cloneElement(
      children as React.ReactElement<any>,
      { project }
    );
    const tabbedProps = {
      resource: {
        title: !isNilOrError(project)
          ? localize(project.attributes.title_multiloc)
          : formatMessage(messages.newProject),
      },
      // TODO: optimization would be to use useMemo for tabs, as they get recalculated on every click
      tabs: !isNilOrError(project) ? this.getTabs(project.id, project) : [],
    };

    if (!isNilOrError(project)) {
      const inputTerm = getInputTerm(
        project.attributes.process_type,
        project,
        phases
      );

      return (
        <>
          <Outlet
            id="app.containers.Admin.projects.edit"
            onData={this.handleData}
          />
          <TopContainer>
            <GoBackButton onClick={this.goBack} />
            <ActionsContainer>
              {tabbedProps.tabs.some((tab) => tab.name === 'ideas') && (
                <Button
                  id="e2e-new-idea"
                  buttonStyle="cl-blue"
                  icon="idea"
                  linkTo={`/projects/${project.attributes.slug}/ideas/new`}
                  text={formatMessage(
                    getInputTermMessage(inputTerm, {
                      idea: messages.addNewIdea,
                      option: messages.addNewOption,
                      project: messages.addNewProject,
                      question: messages.addNewQuestion,
                      issue: messages.addNewIssue,
                      contribution: messages.addNewContribution,
                    })
                  )}
                  onClick={this.onNewIdea(pathname)}
                />
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
            {childrenWithExtraProps}
          </TabbedResource>
        </>
      );
    }

    return null;
  }
}

const AdminProjectEditionWithHoCs = withRouter(
  injectIntl<Props & WithRouterProps>(injectLocalize(AdminProjectEdition))
);

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  surveys_enabled: <GetFeatureFlag name="surveys" />,
  typeform_enabled: <GetFeatureFlag name="typeform_surveys" />,
  customTopicsEnabled: <GetFeatureFlag name="custom_topics" />,
  projectVisibilityEnabled: <GetFeatureFlag name="project_visibility" />,
  granularPermissionsEnabled: <GetFeatureFlag name="granular_permissions" />,
  projectManagementEnabled: <GetFeatureFlag name="project_management" />,
  ideaAssignmentEnabled: <GetFeatureFlag name="idea_assignment" />,
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

export default (inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <AdminProjectEditionWithHoCs {...inputProps} {...dataProps} />
    )}
  </Data>
);
