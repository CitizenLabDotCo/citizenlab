import React, { useState, useEffect } from 'react';

import { Box, colors, Spinner } from '@citizenlab/cl2-component-library';
import {
  Outlet as RouterOutlet,
  useParams,
  useLocation,
} from 'react-router-dom';

import { IPhaseData } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import { IProjectData } from 'api/projects/types';
import useProjectById from 'api/projects/useProjectById';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Timeline from 'containers/ProjectsShowPage/timeline/Timeline';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { defaultAdminCardPadding } from 'utils/styleConstants';

import { getTimelineTab } from '../phaseSetup/utils';
import { FeatureFlags, getTabs, IPhaseTab } from '../tabs';

import { PhaseHeader } from './PhaseHeader';

interface DataProps {
  project: IProjectData;
  selectedPhase?: IPhaseData;
  setSelectedPhase: (phase: IPhaseData) => void;
}

const AdminProjectPhaseIndex = ({
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
    report_builder_enabled: useFeatureFlag({
      name: 'report_builder',
    }),
    phase_insights_enabled: useFeatureFlag({
      name: 'phase_insights',
    }),
  };

  const isNewPhaseLink = pathname.endsWith(
    `admin/projects/${project.id}/phases/new`
  );
  const tabs: IPhaseTab[] = selectedPhase
    ? getTabs(selectedPhase, featureFlags, formatMessage).map((tab) => ({
        ...tab,
        url: `/admin/projects/${project.id}/phases/${selectedPhase.id}/${tab.url}`,
      }))
    : [];

  return (
    <Box display="flex" flexDirection="column" flexGrow={1}>
      <Box mt="16px" px="24px">
        <Timeline
          projectId={project.id}
          selectedPhase={selectedPhase}
          setSelectedPhase={setSelectedPhase}
          isBackoffice
        />
      </Box>
      <Box
        p="8px 24px 24px 24px"
        display="flex"
        flexDirection="column"
        flexGrow={1}
      >
        {!isNewPhaseLink && selectedPhase && (
          <PhaseHeader phase={selectedPhase} tabs={tabs} />
        )}

        <Box
          p={`${defaultAdminCardPadding}px`}
          background={colors.white}
          flexGrow={1}
        >
          <RouterOutlet />
        </Box>
      </Box>
    </Box>
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
  const phaseInsightsEnabled = useFeatureFlag({ name: 'phase_insights' });

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

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (phases.data.length === 0 && !isLoadingPhases && !isFetchingPhases) {
      clHistory.replace(`/admin/projects/${projectId}/phases/new`);
    } else if (phaseShown && pathname.endsWith('phases/setup')) {
      const redirectTab = getTimelineTab(phaseShown, phaseInsightsEnabled);
      clHistory.replace(
        `/admin/projects/${projectId}/phases/${phaseShown.id}/${redirectTab}`
      );
    }

    setSelectedPhase(phaseShown);
  }, [
    phaseId,
    phases,
    projectId,
    pathname,
    isLoadingPhases,
    isFetchingPhases,
    phaseInsightsEnabled,
  ]);

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
    <AdminProjectPhaseIndex
      project={project.data}
      selectedPhase={selectedPhase}
      setSelectedPhase={setSelectedPhase}
    />
  );
};
