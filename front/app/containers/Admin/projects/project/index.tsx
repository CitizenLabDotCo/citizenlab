import React, { useState, useEffect } from 'react';
import clHistory from 'utils/cl-router/history';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import {
  Outlet as RouterOutlet,
  useParams,
  useLocation,
} from 'react-router-dom';

// components
import GoBackButton from 'components/UI/GoBackButton';
import Button from 'components/UI/Button';
import Outlet from 'components/Outlet';
import { Box, Title, colors } from '@citizenlab/cl2-component-library';
import NavigationTabs from 'components/admin/NavigationTabs';
import { PhaseHeader } from './phase/PhaseHeader';

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
import { getMethodConfig } from 'utils/configs/participationMethodConfig';
import Timeline from 'containers/ProjectsShowPage/timeline/Timeline';

// hooks
import useLocalize from 'hooks/useLocalize';
import { IPhaseData } from 'api/phases/types';
import { getCurrentPhase } from 'api/phases/utils';
import { getIntialTabs } from './tabs';

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

export const AdminProjectsProjectIndex = ({
  project,
  phases,
  typeform_enabled,
  surveys_enabled,
}: DataProps) => {
  const { formatMessage } = useIntl();

  const localize = useLocalize();
  const { pathname } = useLocation();
  const initialTabs: ITab[] = getIntialTabs(formatMessage);
  const [tabs, setTabs] = useState<ITab[]>(initialTabs);
  const { projectId, id: phaseId } = useParams() as {
    projectId: string;
    id?: string;
  };
  const [selectedPhase, setSelectedPhase] = useState<IPhaseData | undefined>(
    undefined
  );
  const isNewPhaseLink = pathname.endsWith(
    `admin/projects/${projectId}/phases/new`
  );

  useEffect(() => {
    if (!phases) return;

    const phase = phaseId
      ? phases.find((phase) => phase.id === phaseId)
      : undefined;
    let phaseShown: IPhaseData | undefined = phase;
    if (!phase) {
      const currentPhase = getCurrentPhase(phases);
      if (currentPhase) {
        phaseShown = currentPhase;
      } else {
        phaseShown = phases.length ? phases[0] : undefined;
      }
    }

    // Reset tabs such that tabs that were added onData are removed and will be readded if needed
    // TODO: Fix maps tab condition to display when navigating from voting to ideation
    setTabs(initialTabs);
    setSelectedPhase(phaseShown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseId, phases]);

  if (!selectedPhase) {
    return null;
  }

  const tabHideConditions: TabHideConditions = {
    general: function isGeneralTabHidden() {
      return false;
    },
    description: function isDescriptionTabHidden() {
      return false;
    },
    ideas: function isIdeaTabHidden() {
      return !getMethodConfig(selectedPhase.attributes.participation_method)
        .showInputManager;
    },
    ideaform: function isIdeaFormTabHidden() {
      return (
        getMethodConfig(selectedPhase.attributes.participation_method)
          .formEditor !== 'simpleFormEditor'
      );
    },
    poll: function isPollTabHidden() {
      return selectedPhase.attributes.participation_method !== 'poll';
    },
    survey: function isSurveyTabHidden() {
      return selectedPhase.attributes.participation_method !== 'native_survey';
    },
    'survey-results': function surveyResultsTabHidden() {
      return (
        !surveys_enabled ||
        !typeform_enabled ||
        (surveys_enabled &&
          selectedPhase.attributes.participation_method !== 'survey' &&
          selectedPhase.attributes.survey_service !== 'typeform')
      );
    },
    volunteering: function isVolunteeringTabHidden() {
      return selectedPhase?.attributes.participation_method !== 'volunteering';
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
      <NavigationTabs position="static">
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
              linkTo={`/projects/${project.attributes.slug}`}
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
        selectedPhase={selectedPhase}
      />
      <Box p="40px">
        {!isNewPhaseLink && (
          <PhaseHeader phase={selectedPhase} tabs={getTabs(project.id)} />
        )}

        <Box p="40px" background={colors.white}>
          <RouterOutlet />
        </Box>
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
