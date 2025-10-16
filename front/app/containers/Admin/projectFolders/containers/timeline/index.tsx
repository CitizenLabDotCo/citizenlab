import React, { useEffect, useMemo, useState } from 'react';

import { Box, Spinner, Text } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import { IPhaseData } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import { getLatestRelevantPhase } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';
import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';
import useInfiniteProjectsMiniAdmin from 'api/projects_mini_admin/useInfiniteProjectsMiniAdmin';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useInfiniteScroll from 'hooks/useInfiniteScroll';
import useLocalize from 'hooks/useLocalize';

import sharedMessages from 'containers/Admin/projects/all/_shared/messages';
import { getStatusColor } from 'containers/Admin/projects/all/_shared/utils';
import messages from 'containers/Admin/projects/all/Calendar/messages';
import ProjectGanttChart from 'containers/Admin/projects/all/Calendar/ProjectGanttChart';
import UpsellNudge from 'containers/Admin/projects/all/Calendar/UpsellNudge';
import { AdminProjectPhaseIndex } from 'containers/Admin/projects/project/phase';

import Centerer from 'components/UI/Centerer';
import { GanttItem } from 'components/UI/GanttChart/types';

import { useIntl } from 'utils/cl-intl';

const PAGE_SIZE = 50;

const FolderTimeline = () => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { projectFolderId } = useParams() as { projectFolderId: string };
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [selectedPhase, setSelectedPhase] = useState<IPhaseData | undefined>(
    undefined
  );

  const { data, isLoading, isFetching, isError, fetchNextPage, hasNextPage } =
    useInfiniteProjectsMiniAdmin(
      {
        folder_ids: [projectFolderId],
        sort: 'recently_viewed',
      },
      PAGE_SIZE
    );

  // Fetch full project data for the selected project
  const { data: projectData } = useProjectById(selectedProjectId || undefined);

  // Fetch phases for the selected project
  const { data: phasesData } = usePhases(selectedProjectId || undefined);

  const allProjects = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data?.pages]
  );

  const { loadMoreRef } = useInfiniteScroll({
    isLoading: isFetching,
    hasNextPage: !!hasNextPage,
    onLoadMore: fetchNextPage,
    rootMargin: '0px 0px 200px 0px',
  });

  const projectsById = allProjects.reduce(
    (acc, project) => ({
      ...acc,
      [project.id]: project,
    }),
    {} as Record<string, ProjectMiniAdminData>
  );

  // Update selected phase when phases data changes
  useEffect(() => {
    if (phasesData && selectedProjectId) {
      const phase = getLatestRelevantPhase(phasesData.data);
      setSelectedPhase(phase);
    }
  }, [phasesData, selectedProjectId]);

  if (isLoading) {
    return (
      <Centerer>
        <Spinner />
      </Centerer>
    );
  }

  if (isError) {
    return <Text>{formatMessage(messages.failedToLoadTimelineError)}</Text>;
  }

  if (allProjects.length === 0) {
    return (
      <Box mt="20px">
        <Text>{formatMessage(sharedMessages.noProjects)}</Text>
      </Box>
    );
  }

  const projectsGanttData: GanttItem[] = allProjects.map((project) => ({
    id: project.id,
    title: localize(project.attributes.title_multiloc),
    start: project.attributes.first_phase_start_date,
    end: project.attributes.last_phase_end_date,
    folder: localize(project.attributes.folder_title_multiloc),
    highlight: {
      start: project.attributes.current_phase_start_date,
      end: project.attributes.current_phase_end_date,
    },
    color: getStatusColor(project.attributes.publication_status),
  }));

  const getSentinelMessage = () => {
    if (isFetching) {
      return sharedMessages.loadingMore;
    }

    if (hasNextPage) {
      return sharedMessages.scrollDownToLoadMore;
    }

    return sharedMessages.allProjectsHaveLoaded;
  };
  const sentinelMessage = getSentinelMessage();

  const handlePhaseClick = (ganttItem: GanttItem) => {
    setSelectedProjectId(ganttItem.id);
  };

  return (
    <Box>
      <Box position="relative" mt="16px">
        <ProjectGanttChart
          ganttItems={projectsGanttData}
          projectsById={projectsById}
          onPhaseClick={handlePhaseClick}
        />

        {isFetching && (
          <Box
            w="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="8px"
          >
            <Spinner />
          </Box>
        )}
      </Box>

      {selectedProjectId && projectData && selectedPhase && (
        <Box mt="32px">
          <AdminProjectPhaseIndex
            project={projectData.data}
            selectedPhase={selectedPhase}
            setSelectedPhase={setSelectedPhase}
            hideTimeline={true}
          />
        </Box>
      )}

      <Box ref={loadMoreRef} mt="12px" display="flex" justifyContent="center">
        {formatMessage(sentinelMessage)}
      </Box>
    </Box>
  );
};

const FolderTimelineWrapper = () => {
  const enabled = useFeatureFlag({ name: 'project_planning_calendar' });

  if (!enabled) {
    return <UpsellNudge />;
  }

  return <FolderTimeline />;
};

export default FolderTimelineWrapper;
