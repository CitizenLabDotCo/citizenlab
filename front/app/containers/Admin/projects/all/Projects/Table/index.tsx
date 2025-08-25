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
  IconTooltip,
} from '@citizenlab/cl2-component-library';

import useParticipantCounts from 'api/participant_counts/useParticipantCounts';
import useInfiniteProjectsMiniAdmin from 'api/projects_mini_admin/useInfiniteProjectsMiniAdmin';

import useInfiniteScroll from 'hooks/useInfiniteScroll';

import { useIntl } from 'utils/cl-intl';

import ColHeader from '../../_shared/ColHeader';
import sharedMessages from '../../_shared/messages';
import { useParams } from '../../_shared/params';

import EmptyRow from './EmptyRow';
import messages from './messages';
import Row from './Row';

const PAGE_SIZE = 10;

const Table = () => {
  const { formatMessage } = useIntl();
  const { sort, ...params } = useParams();

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    status,
  } = useInfiniteProjectsMiniAdmin(
    {
      ...params,
      sort: sort ?? 'recently_viewed',
    },
    PAGE_SIZE
  );

  const projects = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data?.pages]
  );

  const projectIds = projects.map((project) => project.id);
  const participantsCounts = useParticipantCounts(projectIds);

  const { loadMoreRef } = useInfiniteScroll({
    isLoading: isFetchingNextPage,
    hasNextPage: !!hasNextPage,
    onLoadMore: fetchNextPage,
    rootMargin: '0px 0px 100px 0px',
  });

  const getSentinelMessage = () => {
    if (isFetchingNextPage) {
      return sharedMessages.loadingMore;
    }

    if (hasNextPage) {
      return sharedMessages.scrollDownToLoadMore;
    }

    if (status === 'success') {
      return sharedMessages.allProjectsHaveLoaded;
    }

    return null;
  };
  const sentinelMessage = getSentinelMessage();

  return (
    <Box position="relative" w="100%" h="100%" minHeight="300px">
      <TableComponent
        border={`1px solid ${colors.grey300}`}
        borderRadius={stylingConsts.borderRadius}
        innerBorders={{ bodyRows: true }}
      >
        <Thead>
          <Tr background={colors.grey50}>
            <ColHeader>{formatMessage(messages.project)}</ColHeader>
            <Th py="16px">
              <Box display="flex" alignItems="center">
                <Icon name="users" height="16px" fill={colors.black} mr="0px" />
                <IconTooltip
                  content={formatMessage(messages.thisColumnUsesCache)}
                />
              </Box>
            </Th>
            <ColHeader>{formatMessage(messages.phase)}</ColHeader>
            <ColHeader>{formatMessage(messages.manager)}</ColHeader>
            <ColHeader>{formatMessage(messages.visibility)}</ColHeader>
            <ColHeader>{formatMessage(messages.start)}</ColHeader>
            <ColHeader>{formatMessage(messages.end)}</ColHeader>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {projects.length === 0 && <EmptyRow />}
          {projects.map((project, i) => (
            <Row
              key={project.id}
              project={project}
              participantsCount={participantsCounts[project.id]}
              firstRow={i === 0}
            />
          ))}
        </Tbody>
      </TableComponent>

      <Box
        ref={loadMoreRef}
        mt="12px"
        display="flex"
        justifyContent="center"
        color={colors.textPrimary}
      >
        {sentinelMessage && formatMessage(sentinelMessage)}
      </Box>

      {isFetchingNextPage && (
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

      {isLoading ||
        (isFetching && !isFetchingNextPage && (
          <Box
            position="absolute"
            left="0"
            top="0"
            minHeight="300px"
            w="100%"
            h="100%"
            display="flex"
            justifyContent="center"
            pt="200px"
            bgColor={colors.white}
            opacity={0.5}
          >
            <Spinner />
          </Box>
        ))}
    </Box>
  );
};

export default Table;
