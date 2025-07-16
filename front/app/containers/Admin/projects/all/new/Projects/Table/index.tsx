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
} from '@citizenlab/cl2-component-library';

import useInfiniteProjectsMiniAdmin from 'api/projects_mini_admin/useInfiniteProjectsMiniAdmin';

import useInfiniteScroll from 'hooks/useInfiniteScroll';

import { useIntl } from 'utils/cl-intl';

import { useParams } from '../utils';

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
    // Only show "All loaded" if the query is done
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
            <Th py="16px">{formatMessage(messages.currentPhase)}</Th>
            <Th py="16px">{formatMessage(messages.projectStart)}</Th>
            <Th py="16px">{formatMessage(messages.projectEnd)}</Th>
            <Th py="16px">{formatMessage(messages.status)}</Th>
            <Th py="16px">{formatMessage(messages.visibility)}</Th>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {projects.map((project) => (
            <Row key={project.id} project={project} />
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
