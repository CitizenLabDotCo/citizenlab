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
  Text,
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

const ColHeader = ({ children }: { children: React.ReactNode }) => (
  <Th py="16px">
    <Text m="0" fontSize="s" fontWeight="bold">
      {children}
    </Text>
  </Th>
);

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
            <ColHeader>{formatMessage(messages.project)}</ColHeader>
            {COLUMN_VISIBILITY.participants && (
              <ColHeader>
                <Icon name="users" height="16px" fill={colors.black} mr="8px" />
              </ColHeader>
            )}
            {COLUMN_VISIBILITY.phase && (
              <ColHeader>{formatMessage(messages.phase)}</ColHeader>
            )}
            {COLUMN_VISIBILITY.projectStart && (
              <ColHeader>{formatMessage(messages.projectStart)}</ColHeader>
            )}
            {COLUMN_VISIBILITY.projectEnd && (
              <ColHeader>{formatMessage(messages.projectEnd)}</ColHeader>
            )}
            {COLUMN_VISIBILITY.status && (
              <ColHeader>{formatMessage(messages.status)}</ColHeader>
            )}
            {COLUMN_VISIBILITY.visibility && (
              <ColHeader>{formatMessage(messages.visibility)}</ColHeader>
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
