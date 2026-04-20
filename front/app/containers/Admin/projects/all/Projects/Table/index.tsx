import React, { useMemo } from 'react';

import {
  Box,
  Table as TableComponent,
  Thead,
  Text,
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
import { groupIncludedResources } from 'utils/cl-react-query/groupIncludedResources';
import { indexById } from 'utils/cl-react-query/indexById';

import ColHeader from '../../_shared/ColHeader';
import sharedMessages from '../../_shared/messages';
import { useParams } from '../../_shared/params';
import { getParticipationMethods } from '../../_shared/utils';

import EmptyRow from './EmptyRow';
import messages from './messages';
import Row from './Row';

const PAGE_SIZE = 10;

const Table = () => {
  const { formatMessage } = useIntl();
  const { sort, participation_methods, ...params } = useParams();

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
      participation_methods: getParticipationMethods(participation_methods),
      sort: sort ?? 'recently_viewed',
    },
    PAGE_SIZE
  );

  const projects = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data?.pages]
  );

  const moderatorsById = useMemo(() => {
    const included = data?.pages.flatMap((page) => page.included ?? []) ?? [];
    const moderators = groupIncludedResources(included).user;
    const moderatorsById = moderators ? indexById(moderators) : undefined;
    return moderatorsById;
  }, [data?.pages]);

  const projectIds = projects.map((project) => project.id);
  const participantsCounts = useParticipantCounts(projectIds);

  const { loadMoreRef } = useInfiniteScroll({
    isLoading: isFetchingNextPage,
    hasNextPage: !!hasNextPage,
    onLoadMore: fetchNextPage,
    rootMargin: '0px 0px 100px 0px',
  });

  // True when loading the initial data,
  // or when loading new (i.e. a new combination of filters) data
  const isLoadingNewData = isLoading || (isFetching && !isFetchingNextPage);

  const isLoadingData = isLoadingNewData || isFetchingNextPage;

  const getSentinelMessage = () => {
    if (isFetchingNextPage) {
      return sharedMessages.loadingMore;
    }

    if (hasNextPage) {
      return sharedMessages.scrollDownToLoadMore;
    }

    if (projects.length === 0 && !isLoadingData) {
      return messages.noProjectsFound;
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
            <ColHeader>{formatMessage(sharedMessages.managers)}</ColHeader>
            <ColHeader>{formatMessage(messages.visibility)}</ColHeader>
            <ColHeader>{formatMessage(messages.start)}</ColHeader>
            <ColHeader>{formatMessage(messages.end)}</ColHeader>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {isLoadingData && (
            <>
              <EmptyRow />
              <EmptyRow />
              <EmptyRow />
            </>
          )}
          {projects.map((project, i) => (
            <Row
              key={project.id}
              project={project}
              participantsCount={participantsCounts[project.id]}
              firstRow={i === 0}
              moderatorsById={moderatorsById}
            />
          ))}
        </Tbody>
      </TableComponent>

      {sentinelMessage && (
        <Box
          ref={loadMoreRef}
          mt="12px"
          display="flex"
          justifyContent="center"
          color={colors.textPrimary}
        >
          <Text>{formatMessage(sentinelMessage)}</Text>
        </Box>
      )}

      {isLoadingNewData && (
        <Box
          position="absolute"
          left="0"
          top="0"
          w="100%"
          h="100%"
          display="flex"
          justifyContent="center"
          pt="80px"
          bgColor={colors.white}
          opacity={0.5}
        >
          <Spinner />
        </Box>
      )}

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
    </Box>
  );
};

export default Table;
