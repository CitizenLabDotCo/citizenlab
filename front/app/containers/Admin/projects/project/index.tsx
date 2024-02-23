import React, { useState, useEffect } from 'react';
import {
  Outlet as RouterOutlet,
  useParams,
  useLocation,
} from 'react-router-dom';
import clHistory from 'utils/cl-router/history';

// components
import Outlet from 'components/Outlet';
import { Box, colors, Spinner } from '@citizenlab/cl2-component-library';
import { PhaseHeader } from './phase/PhaseHeader';
import ProjectHeader from './projectHeader';

// i18n
import { useIntl } from 'utils/cl-intl';

// typings
import { InsertConfigurationOptions, ITab } from 'typings';
import { IProjectData } from 'api/projects/types';

// utils
import { insertConfiguration } from 'utils/moduleUtils';
import Timeline from 'containers/ProjectsShowPage/timeline/Timeline';
import { defaultAdminCardPadding } from 'utils/styleConstants';

// hooks
import { IPhaseData } from 'api/phases/types';
import { getCurrentPhase } from 'api/phases/utils';
import { getIntialTabs, getTabHideConditions } from './tabs';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import { getTimelineTab } from './timeline/utils';

interface DataProps {
  phases: IPhaseData[];
  project: IProjectData;
  selectedPhase?: IPhaseData;
  setSelectedPhase: (phase: IPhaseData) => void;
}

const AdminProjectsProjectIndex = ({
  project,
  phases,
  selectedPhase,
  setSelectedPhase,
}: DataProps) => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const typeform_enabled = useFeatureFlag({
    name: 'typeform_surveys',
  });
  const surveys_enabled = useFeatureFlag({
    name: 'surveys',
  });
  const granular_permissions_enabled = useFeatureFlag({
    name: 'granular_permissions',
  });
  const phase_reports_enabled = useFeatureFlag({
    name: 'phase_reports',
  });

  const isNewPhaseLink = pathname.endsWith(
    `admin/projects/${project.id}/phases/new`
  );
  const initialTabs: ITab[] = getIntialTabs(formatMessage);
  const [tabs, setTabs] = useState<ITab[]>(initialTabs);

  const getTabs = () => {
    if (!selectedPhase) {
      return [];
    }
    const tabHideConditions = getTabHideConditions(selectedPhase, {
      typeform_enabled,
      surveys_enabled,
      granular_permissions_enabled,
      phase_reports_enabled,
    });

    const baseTabsUrl = `/admin/projects/${project.id}`;
    const cleanedTabs = tabs.filter((tab) => {
      if (tabHideConditions[tab.name]) {
        return !tabHideConditions[tab.name]();
      }
      return true;
    });

    return cleanedTabs.map((tab) => ({
      ...tab,
      url:
        tab.url === ''
          ? `${baseTabsUrl}`
          : `${baseTabsUrl}/phases/${selectedPhase.id}/${tab.url}`,
    }));
  };

  const handleData = (data: InsertConfigurationOptions<ITab>) => {
    setTabs((tabs) => insertConfiguration(data)(tabs));
  };

  const onRemove = (name: string) => {
    const updatedTabs = tabs.filter((tab) => tab.name !== name);
    setTabs(updatedTabs);
  };

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

      <Outlet
        id="app.containers.Admin.projects.edit"
        onData={handleData}
        onRemove={onRemove}
        project={project}
        phases={phases}
        selectedPhase={selectedPhase}
      />
      <Box p="8px 24px 24px 24px">
        {!isNewPhaseLink && selectedPhase && (
          <PhaseHeader phase={selectedPhase} tabs={getTabs()} />
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
      phases={phases.data}
      selectedPhase={selectedPhase}
      setSelectedPhase={setSelectedPhase}
    />
  );
};
