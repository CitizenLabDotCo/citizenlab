import React, { useState, useEffect } from 'react';
import {
  Outlet as RouterOutlet,
  useParams,
  useLocation,
} from 'react-router-dom';
import clHistory from 'utils/cl-router/history';

// components
import { Box, colors, Spinner } from '@citizenlab/cl2-component-library';
import { PhaseHeader } from './phase/PhaseHeader';
import ProjectHeader from './projectHeader';

// i18n
import { useIntl } from 'utils/cl-intl';

// typings
import { IProjectData } from 'api/projects/types';

// utils
import Timeline from 'containers/ProjectsShowPage/timeline/Timeline';
import { defaultAdminCardPadding } from 'utils/styleConstants';

// hooks
import { IPhaseData } from 'api/phases/types';
import { getCurrentPhase } from 'api/phases/utils';
import { FeatureFlags, getTabs, IPhaseTab } from './tabs';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import { getTimelineTab } from './timeline/utils';

interface DataProps {
  project: IProjectData;
  selectedPhase?: IPhaseData;
  setSelectedPhase: (phase: IPhaseData) => void;
}

const AdminProjectsProjectIndex = ({
  project,
  selectedPhase,
  setSelectedPhase,
}: DataProps) => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const featureFlags: FeatureFlags = {
    typeform_enabled: useFeatureFlag({
      name: 'typeform_surveys',
    }),
    surveys_enabled: useFeatureFlag({
      name: 'surveys',
    }),
    granular_permissions_enabled: useFeatureFlag({
      name: 'granular_permissions',
    }),
    phase_reports_enabled: useFeatureFlag({
      name: 'phase_reports',
    }),
  };

  const isNewPhaseLink = pathname.endsWith(
    `admin/projects/${project.id}/phases/new`
  );
  const baseTabsUrl = `/admin/projects/${project.id}`;
  const tabs: IPhaseTab[] = selectedPhase
    ? getTabs(selectedPhase, featureFlags, formatMessage).map((tab) => ({
        ...tab,
        url: `${baseTabsUrl}/phases/${selectedPhase.id}/${tab.url}`,
      }))
    : [];

  return (
    <>
      <ProjectHeader projectId={project.id} />
      <Box mt="16px" px="24px">
        <Timeline
          projectId={project.id}
          selectedPhase={selectedPhase}
          setSelectedPhase={setSelectedPhase}
          isBackoffice
        />
      </Box>
      <Box p="8px 24px 24px 24px">
        {!isNewPhaseLink && selectedPhase && (
          <PhaseHeader phase={selectedPhase} tabs={tabs} />
        )}

        <Box p={`${defaultAdminCardPadding}px`} background={colors.white}>
          <RouterOutlet />
        </Box>
      </Box>
    </>
  );
};

export default () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };
  const { data: project, isLoading: isLoadingProject } =
    useProjectById(projectId);
  const {
    data: phases,
    isLoading: isLoadingPhases,
    isFetching: isFetchingPhases,
  } = usePhases(projectId);
  const [selectedPhase, setSelectedPhase] = useState<IPhaseData | undefined>(
    undefined
  );
  const { pathname } = useLocation();

  useEffect(() => {
    if (!phases) return;

    const phase = phaseId
      ? phases.data.find((phase) => phase.id === phaseId)
      : undefined;
    let phaseShown: IPhaseData | undefined = phase;
    if (!phase && !pathname.endsWith('/phases/new')) {
      const currentPhase = getCurrentPhase(phases.data);
      if (currentPhase) {
        phaseShown = currentPhase;
      } else {
        phaseShown = phases.data.length ? phases.data[0] : undefined;
      }
    }

    if (phases.data.length === 0 && !isLoadingPhases && !isFetchingPhases) {
      clHistory.replace(`/admin/projects/${projectId}/phases/new`);
    } else if (phaseShown && pathname.endsWith('phases/setup')) {
      const redirectTab = getTimelineTab(phaseShown);
      clHistory.replace(
        `/admin/projects/${projectId}/phases/${phaseShown.id}/${redirectTab}`
      );
    }

    setSelectedPhase(phaseShown);
  }, [phaseId, phases, projectId, pathname, isLoadingPhases, isFetchingPhases]);

  if (isLoadingProject || isLoadingPhases) {
    return (
      <Box
        width="100%"
        height="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner />
      </Box>
    );
  }

  if (!project || !phases) {
    return null;
  }

  return (
    <AdminProjectsProjectIndex
      project={project.data}
      selectedPhase={selectedPhase}
      setSelectedPhase={setSelectedPhase}
    />
  );
};
