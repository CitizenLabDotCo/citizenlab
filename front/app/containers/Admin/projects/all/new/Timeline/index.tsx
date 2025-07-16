import React, { useMemo } from 'react';
import { Box, colors, Spinner, Text } from '@citizenlab/cl2-component-library';
import { useIntl } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';
import { useParams } from '../Projects/utils';
import Filters from '../Projects/Filters';
import Centerer from 'components/UI/Centerer';

import { useInfiniteProjectsMiniAdmin } from 'api/projects_mini_admin/useInfiniteProjectsMiniAdmin';

import ProjectGanttChart from './ProjectGanttChart';
import { GanttItem } from 'components/UI/GanttChart/types';
import messages from './messages';
import projectMessages from '../Projects/Table/messages';
import { useInfiniteScroll } from 'hooks/useInfiniteScroll';

const PAGE_SIZE = 10;

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'published':
      return colors.green500;
    case 'draft':
      return colors.orange500;
    case 'archived':
      return colors.background;
    default:
      return undefined;
  }
};

const Timeline = () => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const params = useParams();

  const {
    data,
    isLoading,
    isFetching,
    isError,
    fetchNextPage,
    hasNextPage,
    status,
  } = useInfiniteProjectsMiniAdmin(
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
    icon: project.attributes.folder_title_multiloc ? 'folder-solid' : undefined,
  }));

  const getSentinelMessage = () => {
    if (isFetching) {
      return projectMessages.loadingMore;
    }
    if (hasNextPage) {
      return projectMessages.scrollDownToLoadMore;
    }
    // Only show "All loaded" if the query is done
    if (status === 'success' && !hasNextPage) {
      return projectMessages.allProjectsHaveLoaded;
    }

    return null;
  };
  const sentinelMessage = getSentinelMessage();

  return (
    <Box>
      <Filters />
      <Box position="relative" mt="16px">
        <ProjectGanttChart projects={projectsGanttData} />

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
        {sentinelMessage && formatMessage(sentinelMessage)}
      </Box>
    </Box>
  );
};

export default Timeline;
