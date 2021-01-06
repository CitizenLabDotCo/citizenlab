import React, { PureComponent } from 'react';
import { reject } from 'lodash-es';
import clHistory from 'utils/cl-router/history';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// components
import GoBackButton from 'components/UI/GoBackButton';
import Button from 'components/UI/Button';
import TabbedResource, { TabProps } from 'components/admin/TabbedResource';

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

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';

// typings
import { IProjectData } from 'services/projects';

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

// Note: projectParentPageUrl can be either the url of a folder to whoch the project belongs,
// or the projects overview page if the project does not belong to a folder
interface State {
  projectParentPageUrl: string | null;
  goBackUrl: string | null;
}

interface Props extends InputProps, DataProps {}

export class AdminProjectEdition extends PureComponent<
  Props & InjectedIntlProps & InjectedLocalized & WithRouterProps & ITracks,
  State
> {
  constructor(props) {
    super(props);
    this.state = {
      projectParentPageUrl: null,
      goBackUrl: null,
    };
  }

  componentDidMount() {
    const { previousPathName } = this.props;
    const urlSegments = previousPathName?.replace(/^\/+/g, '').split('/');

    if (urlSegments?.[1] === 'admin' && urlSegments?.[2] === 'projects') {
      this.setState({
        projectParentPageUrl: previousPathName,
        goBackUrl: previousPathName,
      });
    }
  }

  componentDidUpdate(
    prevProps: Props &
      InjectedIntlProps &
      InjectedLocalized &
      WithRouterProps &
      ITracks
  ) {
    const newPathname = this.props.location.pathname;
    const prevPathname = prevProps.location.pathname;

    if (
      newPathname.length > prevPathname.length &&
      newPathname.startsWith(prevPathname)
    ) {
      this.setState({ goBackUrl: prevPathname });
    }

    if (
      newPathname.length < prevPathname.length &&
      prevPathname.startsWith(newPathname)
    ) {
      this.setState(({ projectParentPageUrl: aboveProjectPageUrl }) => ({
        goBackUrl: aboveProjectPageUrl,
      }));
    }
  }

  getTabs = (projectId: string, project: IProjectData) => {
    const baseTabsUrl = `/admin/projects/${projectId}`;
    const { formatMessage } = this.props.intl;
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
    let tabs: TabProps[] = [
      {
        label: formatMessage(messages.generalTab),
        url: `${baseTabsUrl}/edit`,
        name: 'general',
      },
      {
        label: formatMessage(messages.descriptionTab),
        url: `${baseTabsUrl}/description`,
        name: 'description',
      },
      {
        label: formatMessage(messages.ideasTab),
        url: `${baseTabsUrl}/ideas`,
        name: 'ideas',
      },
      {
        label: formatMessage(messages.pollTab),
        url: `${baseTabsUrl}/poll`,
        feature: 'polls',
        name: 'poll',
      },
      {
        label: formatMessage(messages.surveyResultsTab),
        url: `${baseTabsUrl}/survey-results`,
        name: 'survey-results',
      },
      {
        label: formatMessage(messages.ideaFormTab),
        url: `${baseTabsUrl}/ideaform`,
        feature: 'idea_custom_fields',
        name: 'ideaform',
      },
      {
        label: formatMessage(messages.phasesTab),
        url: `${baseTabsUrl}/timeline`,
        name: 'phases',
      },
      {
        label: formatMessage(messages.topicsTab),
        url: `${baseTabsUrl}/topics`,
        name: 'topics',
      },
      {
        label: formatMessage(messages.volunteeringTab),
        url: `${baseTabsUrl}/volunteering`,
        feature: 'volunteering',
        name: 'volunteering',
      },
      {
        label: formatMessage(messages.eventsTab),
        url: `${baseTabsUrl}/events`,
        name: 'events',
      },
      {
        label: formatMessage(messages.permissionsTab),
        url: `${baseTabsUrl}/permissions`,
        feature: 'private_projects',
        name: 'permissions',
      },
    ];

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

    tabNames.forEach((tabName) => {
      if (tabName && tabHideConditions[tabName]()) {
        tabs = reject(tabs, { name: tabName });
      }
    });

    return tabs;
  };

  goBack = () => {
    clHistory.push(this.state.goBackUrl || '/admin/projects');
  };

  onNewIdea = (pathname: string) => (_event) => {
    trackEventByName(tracks.clickNewIdea.name, {
      extra: { pathnameFrom: pathname },
    });
  };

  render() {
    const { projectId } = this.props.params;
    const {
      project,
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
      tabs:
        projectId && !isNilOrError(project)
          ? this.getTabs(projectId, project)
          : [],
    };

    return (
      <>
        <TopContainer>
          <GoBackButton onClick={this.goBack} />
          <ActionsContainer>
            {!isNilOrError(project) &&
              tabbedProps.tabs.findIndex((tab) => tab.name === 'ideas') !==
                -1 && (
                <Button
                  id="e2e-new-idea"
                  buttonStyle="cl-blue"
                  icon="idea"
                  linkTo={`/projects/${project.attributes.slug}/ideas/new`}
                  text={formatMessage(messages.addNewIdea)}
                  onClick={this.onNewIdea(pathname)}
                />
              )}
            {!isNilOrError(project) && (
              <Button
                buttonStyle="cl-blue"
                icon="eye"
                id="to-project"
                linkTo={`/projects/${project.attributes.slug}`}
              >
                <FormattedMessage {...messages.viewPublicProject} />
              </Button>
            )}
          </ActionsContainer>
        </TopContainer>
        <TabbedResource {...tabbedProps}>
          {childrenWithExtraProps}
        </TabbedResource>
      </>
    );
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
