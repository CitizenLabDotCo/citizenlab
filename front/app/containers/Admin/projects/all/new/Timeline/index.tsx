import React, { useState } from 'react';

import { Box, Spinner, Text } from '@citizenlab/cl2-component-library';

import useProjectsMiniAdmin from 'api/projects_mini_admin/useProjectsMiniAdmin';

import useLocalize from 'hooks/useLocalize';

import { PaginationWithoutPositioning } from 'components/Pagination';
import Centerer from 'components/UI/Centerer';

import { useIntl } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import Filters from '../Projects/Filters';
import { useParams } from '../Projects/utils';

import messages from './messages';
import ProjectGanttChart, { GanttProject } from './ProjectGanttChart';

const Timeline = () => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const [currentPage, setCurrentPage] = useState(1);
  const params = useParams();

  const {
    data: projects,
    isLoading,
    isFetching,
    isError,
  } = useProjectsMiniAdmin({
    ...params,
    sort: params.sort ?? 'phase_starting_or_ending_soon',
    'page[size]': 10,
    'page[number]': currentPage,
  });

  const projectsGanttData: GanttProject[] = (projects?.data || []).map(
    (project) => ({
      id: project.id,
      title: localize(project.attributes.title_multiloc),
      start: project.attributes.first_phase_start_date,
      end: project.attributes.last_phase_end_date,
      folder: localize(project.attributes.folder_title_multiloc),
    })
  );

  const lastPageLink = projects?.links.last;
  const lastPage = lastPageLink ? getPageNumberFromUrl(lastPageLink) ?? 1 : 1;

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

  return (
    <Box>
      <Filters />

      <Box position="relative" mt="16px">
        <ProjectGanttChart projects={projectsGanttData} />

        {isFetching && (
          <Box
            position="absolute"
            w="100%"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="rgba(255, 255, 255, 0.7)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="8px"
          >
            <Spinner />
          </Box>
        )}
      </Box>

      {lastPage > 1 && (
        <Box mt="12px">
          <PaginationWithoutPositioning
            currentPage={currentPage}
            totalPages={lastPage}
            loadPage={setCurrentPage}
          />
        </Box>
      )}
    </Box>
  );
};

export default Timeline;
