import React, { useState, useEffect } from 'react';
import { some } from 'lodash-es';
import clHistory from 'utils/cl-router/history';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { Outlet as RouterOutlet, useParams } from 'react-router-dom';

// components
import GoBackButton from 'components/UI/GoBackButton';
import Button from 'components/UI/Button';
import TabbedResource from 'components/admin/TabbedResource';
import Outlet from 'components/Outlet';
import { Box, Title } from '@citizenlab/cl2-component-library';
import NavigationTabs from 'components/admin/NavigationTabs';

// resources
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import { PreviousPathnameContext } from 'context';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// typings
import { InsertConfigurationOptions, ITab } from 'typings';
import { IProjectData } from 'api/projects/types';

// utils
import { insertConfiguration } from 'utils/moduleUtils';
import {
  getAllParticipationMethods,
  getMethodConfig,
  showInputManager,
} from 'utils/configs/participationMethodConfig';
import Timeline from 'containers/ProjectsShowPage/timeline/Timeline';

// hooks
import useLocalize from 'hooks/useLocalize';
import { IPhaseData } from 'api/phases/types';
import { getCurrentPhase } from 'api/phases/utils';

export interface InputProps {}

interface DataProps {
  surveys_enabled: GetFeatureFlagChildProps;
  typeform_enabled: GetFeatureFlagChildProps;
  phases: GetPhasesChildProps;
  project: GetProjectChildProps;
  previousPathName: string | null;
}

type TabHideConditions = {
  [tabName: string]: (
    project: IProjectData,
    phases: GetPhasesChildProps
  ) => boolean;
};

const AdminProjectsProjectIndex = ({
  project,
  phases,
  typeform_enabled,
  surveys_enabled,
}: DataProps) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { id: phaseId } = useParams() as {
    id: string;
  };
  const [selectedPhase, setSelectedPhase] = useState<IPhaseData | undefined>(
    undefined
  );

  useEffect(() => {
    if (phases && project) {
      const phase = phases.find((phase) => phase.id === phaseId);
      const phaseShown =
        phase || getCurrentPhase(phases) || phases.length
          ? phases[0]
          : undefined;
      setSelectedPhase(phaseShown);
    }
  }, [phaseId, phases, project]);

  const [tabs, setTabs] = useState<ITab[]>([
    {
      label: formatMessage(messages.setup),
      url: 'setup',
      name: 'setup',
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
  ]);
  const tabHideConditions: TabHideConditions = {
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
        (method) => getMethodConfig(method).formEditor === 'simpleFormEditor'
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
    'survey-results': function surveyResultsTabHidden(project, phases) {
      const processType = project?.attributes.process_type;
      const participationMethod = project.attributes.participation_method;

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
  };

  if (!project || !phases || !selectedPhase) {
    return null;
  }

  const getTabs = (projectId: string) => {
    const baseTabsUrl = `/admin/projects/${projectId}`;
    const cleanedTabs = tabs.filter((tab) => {
      if (tabHideConditions[tab.name]) {
        return !tabHideConditions[tab.name](project, phases);
      }
      return true;
    });

    return cleanedTabs.map((tab) => ({
      ...tab,
      url: tab.url === '' ? `${baseTabsUrl}` : `${baseTabsUrl}/${tab.url}`,
    }));
  };

  const goBack = () => {
    clHistory.push(`/admin/projects/`);
  };

  const handleData = (data: InsertConfigurationOptions<ITab>) => {
    setTabs((tabs) => insertConfiguration(data)(tabs));
  };

  return (
    <>
      <NavigationTabs>
        <Box
          display="flex"
          height="58px"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
          pr="24px"
        >
          <Box display="flex">
            <GoBackButton onClick={goBack} showGoBackText={false} />
            <Title color="blue500" variant="h3" my="0px" ml="8px">
              {localize(project.attributes.title_multiloc)}
            </Title>
          </Box>
          <Box display="flex">
            <Button
              linkTo=""
              buttonStyle="primary-inverse"
              icon="eye"
              size="s"
              padding="4px 8px"
              mr="12px"
            >
              {formatMessage(messages.view)}
            </Button>
            <Button
              linkTo={`/admin/projects/${project.id}/settings`}
              buttonStyle="secondary"
              icon="settings"
              size="s"
              padding="4px 8px"
            >
              {formatMessage(messages.settings)}
            </Button>
          </Box>
        </Box>
      </NavigationTabs>
      <Box mt="78px" px="40px">
        <Timeline
          projectId={project.id}
          selectedPhase={selectedPhase}
          setSelectedPhase={setSelectedPhase}
          isBackoffice
        />
      </Box>

      <Outlet
        id="app.containers.Admin.projects.edit"
        onData={handleData}
        project={project}
        phases={phases}
      />
      <Box p="40px">
        <TabbedResource
          resource={{
            title: '',
          }}
          tabs={getTabs(project.id)}
        >
          <RouterOutlet />
        </TabbedResource>
      </Box>
    </>
  );
};

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
      <AdminProjectsProjectIndex {...inputProps} {...dataProps} />
    )}
  </Data>
));
