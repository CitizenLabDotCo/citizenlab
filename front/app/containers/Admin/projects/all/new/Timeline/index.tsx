import React, { useMemo } from 'react';

import { Box, Spinner, Text } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';
import useInfiniteProjectsMiniAdmin from 'api/projects_mini_admin/useInfiniteProjectsMiniAdmin';

import useInfiniteScroll from 'hooks/useInfiniteScroll';
import useLocalize from 'hooks/useLocalize';

import Centerer from 'components/UI/Centerer';
import { GanttItem } from 'components/UI/GanttChart/types';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { canModerateProjectByIds } from 'utils/permissions/rules/projectPermissions';

import { getStatusColor } from '../_shared/utils';
import Filters from '../Projects/Filters';
import projectMessages from '../Projects/Table/messages';
import { useParams } from '../Projects/utils';

import messages from './messages';
import ProjectGanttChart from './ProjectGanttChart';

const PAGE_SIZE = 10;

const Timeline = () => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const params = useParams();
  const { data: authUser } = useAuthUser();

  const { data, isLoading, isFetching, isError, fetchNextPage, hasNextPage } =
    useInfiniteProjectsMiniAdmin(
      {
        ...params,
        sort: params.sort ?? 'phase_starting_or_ending_soon',
      },
      PAGE_SIZE
    );

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

  const projectsGanttData: GanttItem[] = allProjects.map((project) => {
    const folderId = project.relationships.folder?.data?.id;
    const userCanModerateProject = authUser
      ? canModerateProjectByIds({
          projectId: project.id,
          folderId,
          user: authUser,
        })
      : false;

    return {
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
      icon: project.attributes.folder_title_multiloc
        ? 'folder-solid'
        : undefined,
      onClick: userCanModerateProject
        ? () => clHistory.push(`/admin/projects/${project.id}`)
        : undefined,
    };
  });

  const getSentinelMessage = () => {
    if (isFetching) {
      return projectMessages.loadingMore;
    }

    if (hasNextPage) {
      return projectMessages.scrollDownToLoadMore;
    }

    return projectMessages.allProjectsHaveLoaded;
  };
  const sentinelMessage = getSentinelMessage();

  return (
    <Box>
      <Filters />
      <Box position="relative" mt="16px">
        <ProjectGanttChart
          ganttItems={projectsGanttData}
          projectsById={projectsById}
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

      <Box ref={loadMoreRef} mt="12px" display="flex" justifyContent="center">
        {formatMessage(sentinelMessage)}
      </Box>
    </Box>
  );
};

export default Timeline;
