import React, { useMemo } from 'react';

import {
  Box,
  Table as TableComponent,
  Thead,
  Tr,
  Th,
  Tbody,
  colors,
  stylingConsts,
  Spinner,
  Icon,
} from '@citizenlab/cl2-component-library';

import useParticipantCounts from 'api/participant_counts/useParticipantCounts';
import useInfiniteProjectsMiniAdmin from 'api/projects_mini_admin/useInfiniteProjectsMiniAdmin';

import useInfiniteScroll from 'hooks/useInfiniteScroll';

import { useIntl } from 'utils/cl-intl';

import { useParams } from '../utils';

import { COLUMN_VISIBILITY } from './constants';
import messages from './messages';
import Row from './Row';

const PAGE_SIZE = 10;

const Table = () => {
  const { formatMessage } = useIntl();
  const { sort, ...params } = useParams();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    status,
  } = useInfiniteProjectsMiniAdmin(
    {
      ...params,
      sort: sort ?? 'phase_starting_or_ending_soon',
    },
    PAGE_SIZE
  );

  const projects = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data?.pages]
  );

  const projectIds = projects.map((project) => project.id);
  const { data: participantsCounts } = useParticipantCounts(projectIds);

  const { loadMoreRef } = useInfiniteScroll({
    isLoading: isFetchingNextPage,
    hasNextPage: !!hasNextPage,
    onLoadMore: fetchNextPage,
    rootMargin: '0px 0px 100px 0px',
  });

  const getSentinelMessage = () => {
    if (isFetchingNextPage) {
      return messages.loadingMore;
    }

    if (hasNextPage) {
      return messages.scrollDownToLoadMore;
    }

    if (status === 'success') {
      return messages.allProjectsHaveLoaded;
    }

    return null;
  };
  const sentinelMessage = getSentinelMessage();

  return (
    <Box position="relative" w="100%" h="100%">
      <TableComponent
        border={`1px solid ${colors.grey300}`}
        borderRadius={stylingConsts.borderRadius}
        innerBorders={{ bodyRows: true }}
      >
        <Thead>
          <Tr background={colors.grey50}>
            <Th py="16px">{formatMessage(messages.project)}</Th>
            {COLUMN_VISIBILITY.participants && (
              <Th py="16px">
                <Icon
                  name="users"
                  height="16px"
                  fill={colors.primary}
                  mr="8px"
                />
              </Th>
            )}
            {COLUMN_VISIBILITY.phase && (
              <Th py="16px">{formatMessage(messages.phase)}</Th>
            )}
            {COLUMN_VISIBILITY.projectStart && (
              <Th py="16px">{formatMessage(messages.projectStart)}</Th>
            )}
            {COLUMN_VISIBILITY.projectEnd && (
              <Th py="16px">{formatMessage(messages.projectEnd)}</Th>
            )}
            {COLUMN_VISIBILITY.status && (
              <Th py="16px">{formatMessage(messages.status)}</Th>
            )}
            {COLUMN_VISIBILITY.visibility && (
              <Th py="16px">{formatMessage(messages.visibility)}</Th>
            )}
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {projects.map((project) => (
            <Row
              key={project.id}
              project={project}
              participantsCount={
                participantsCounts?.data.attributes.participant_counts[
                  project.id
                ]
              }
            />
          ))}
        </Tbody>
      </TableComponent>

      <Box ref={loadMoreRef} mt="12px" display="flex" justifyContent="center">
        {sentinelMessage && formatMessage(sentinelMessage)}
      </Box>

      {(isLoading || isFetchingNextPage) && (
        <Box
          w="100%"
          p="4px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Spinner />
        </Box>
      )}
    </Box>
  );
};

export default Table;
