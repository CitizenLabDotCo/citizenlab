import React, { useState } from 'react';
import { reject, some } from 'lodash-es';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import {
  Outlet as RouterOutlet,
  useLocation,
  useParams,
} from 'react-router-dom';

// components
import GoBackButton from 'components/UI/GoBackButton';
import Button from 'components/UI/Button';
import TabbedResource from 'components/admin/TabbedResource';
import { Box } from '@citizenlab/cl2-component-library';
import NewIdeaButton from './ideas/NewIdeaButton';
import NewIdeaButtonDropdown from './ideas/NewIdeaButtonDropdown';

// resources

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';

// typings
import { getInputTerm } from 'services/participationContexts';

// utils
import {
  getAllParticipationMethods,
  getMethodConfig,
  showInputManager,
} from 'utils/configs/participationMethodConfig';
import useLocalize from 'hooks/useLocalize';
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { ITab, InsertConfigurationOptions } from 'typings';
import { insertConfiguration } from 'utils/moduleUtils';
import Outlet from 'components/Outlet';

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

const AdminProjectsProjectIndex = () => {
  const { projectId } = useParams() as { projectId: string };
  const { pathname } = useLocation();
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const isSurveyEnabled = useFeatureFlag({ name: 'surveys' });
  const isTypeformEnabled = useFeatureFlag({ name: 'typeform_surveys' });

  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const [showIdeaDropdown, setShowIdeaDropdown] = useState(false);

  const [tabs, setTabs] = useState<ITab[]>([
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
        url.endsWith('native-survey') || url.endsWith('native-survey/results'),
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
  ]);

  if (project && phases !== undefined) {
    const tabHideConditions = {
      general: function isGeneralTabHidden() {
        return false;
      },
      description: function isDescriptionTabHidden() {
        return false;
      },
      ideas: function isIdeaTabHidden() {
        return !showInputManager(project.data, phases?.data);
      },
      ideaform: function isIdeaFormTabHidden() {
        const allParticipationMethods = getAllParticipationMethods(
          project.data,
          phases.data || null
        );
        return !some(
          allParticipationMethods,
          (method) => getMethodConfig(method).formEditor === 'simpleFormEditor'
        );
      },
      poll: function isPollTabHidden() {
        const processType = project?.data.attributes.process_type;
        const participationMethod =
          project.data.attributes.participation_method;

        if (
          (processType === 'continuous' && participationMethod !== 'poll') ||
          (processType === 'timeline' &&
            phases &&
            phases.data.filter((phase) => {
              return phase.attributes.participation_method === 'poll';
            }).length === 0)
        ) {
          return true;
        }

        return false;
      },
      survey: function isSurveyTabHidden() {
        const processType = project.data.attributes.process_type;
        const participationMethod =
          project.data.attributes.participation_method;
        const noNativeSurveyInTimeline =
          phases &&
          !phases.data.some(
            (phase) => phase.attributes.participation_method === 'native_survey'
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
      'survey-results': function surveyResultsTabHidden() {
        const processType = project?.data.attributes.process_type;
        const participationMethod =
          project.data.attributes.participation_method;

        if (
          (participationMethod !== 'survey' && processType === 'continuous') ||
          !isSurveyEnabled ||
          !isTypeformEnabled ||
          (isSurveyEnabled &&
            isTypeformEnabled &&
            processType === 'continuous' &&
            participationMethod === 'survey' &&
            project.data.attributes.survey_service !== 'typeform') ||
          (processType === 'timeline' &&
            phases &&
            phases.data.filter((phase) => {
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
      topics: function topicsTabHidden() {
        const processType = project.data.attributes.process_type;
        const participationMethod =
          project.data.attributes.participation_method;
        const hideTab =
          (processType === 'continuous' &&
            participationMethod !== 'ideation' &&
            participationMethod !== 'voting') ||
          (processType === 'timeline' &&
            phases &&
            phases.data.filter((phase) => {
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
      volunteering: function isVolunteeringTabHidden() {
        const processType = project?.data.attributes.process_type;
        const participationMethod =
          project.data.attributes.participation_method;

        if (
          (processType === 'continuous' &&
            participationMethod !== 'volunteering') ||
          (processType === 'timeline' &&
            phases &&
            phases.data.filter((phase) => {
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
    };

    const getTabs = (projectId: string) => {
      const baseTabsUrl = `/admin/projects/${projectId}`;

      const tabNames = tabs.map((tab) => tab.name);
      let cleanedTabs = tabs;

      tabNames.forEach((tabName) => {
        if (
          tabName &&
          tabHideConditions[tabName] &&
          tabHideConditions[tabName]()
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

    const goBack = () => {
      clHistory.push(`/admin/projects/`);
    };

    const onNewIdea = (pathname: string) => (_event) => {
      trackEventByName(tracks.clickNewIdea.name, {
        extra: { pathnameFrom: pathname },
      });
    };

    const handleData = (insertTabOptions: InsertConfigurationOptions<ITab>) => {
      setTabs((tabs) => {
        return insertConfiguration(insertTabOptions)(tabs);
      });
    };

    const tabbedProps = {
      resource: {
        title: !isNilOrError(project)
          ? localize(project.data.attributes.title_multiloc)
          : formatMessage(messages.newProject),
      },
      tabs: !isNilOrError(project) ? getTabs(project.data.id) : [],
    };

    let numberIdeationPhases = 0;
    let ideationPhase;

    const inputTerm = getInputTerm(
      project?.data.attributes.process_type,
      project.data,
      phases.data
    );

    if (phases) {
      phases.data.map((phase) => {
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
      project.data.attributes.process_type === 'timeline' &&
      numberIdeationPhases > 1;
    const hasIdeasTab = tabbedProps.tabs.some((tab) => tab.name === 'ideas');

    return (
      <>
        <Outlet
          id="app.containers.Admin.projects.edit"
          onData={handleData}
          project={project.data}
          phases={phases.data}
        />

        <TopContainer>
          <GoBackButton onClick={goBack} />
          <ActionsContainer>
            {hasIdeasTab && (
              <>
                <Box
                  onClick={onNewIdea(pathname)}
                  onMouseOver={() => {
                    if (showDropdownButton) {
                      setShowIdeaDropdown(true);
                    }
                  }}
                  onMouseLeave={() => {
                    if (showDropdownButton) {
                      setShowIdeaDropdown(false);
                    }
                  }}
                >
                  {project.data.attributes.process_type === 'continuous' && (
                    <NewIdeaButton
                      inputTerm={inputTerm}
                      linkTo={`/projects/${project.data.attributes.slug}/ideas/new`}
                    />
                  )}
                  {project.data.attributes.process_type === 'timeline' &&
                    numberIdeationPhases === 1 && (
                      <NewIdeaButton
                        inputTerm={ideationPhase.attributes.input_term}
                        linkTo={`/projects/${project.data.attributes.slug}/ideas/new?phase_id=${ideationPhase.id}`}
                      />
                    )}
                  {showDropdownButton && (
                    <NewIdeaButtonDropdown
                      phases={phases.data}
                      project={project.data}
                      showDropdown={showIdeaDropdown}
                    />
                  )}
                </Box>
              </>
            )}
            <Button
              buttonStyle="cl-blue"
              icon="eye"
              id="to-project"
              linkTo={`/projects/${project.data.attributes.slug}`}
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
};

export default AdminProjectsProjectIndex;
