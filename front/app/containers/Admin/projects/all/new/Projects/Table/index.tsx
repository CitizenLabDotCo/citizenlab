import React, { useEffect, useMemo, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery } from '@tanstack/react-query';
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
import { useIntl } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import { useParams } from '../utils';
import Row from './Row';
import messages from './messages';

import fetcher from 'utils/cl-react-query/fetcher';
import { ProjectsMiniAdmin, Parameters } from 'api/projects_mini_admin/types';

const PAGE_SIZE = 10;

const fetchProjectsMiniAdmin = async (
  queryParameters: Parameters
): Promise<ProjectsMiniAdmin> =>
  fetcher<ProjectsMiniAdmin>({
    path: '/projects/for_admin',
    action: 'get',
    queryParams: {
      ...queryParameters,
      'page[size]': queryParameters['page[size]'] ?? PAGE_SIZE,
      'page[number]': queryParameters['page[number]'] ?? 1,
    },
  });

const Table = () => {
  const { formatMessage } = useIntl();
  const { sort, ...params } = useParams();

  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    status,
  } = useInfiniteQuery(
    ['projects', params, sort],
    ({ pageParam = 1 }) =>
      fetchProjectsMiniAdmin({
        ...params,
        sort: sort ?? 'phase_starting_or_ending_soon',
        'page[size]': PAGE_SIZE,
        'page[number]': pageParam,
      }),
    {
      getNextPageParam: (lastPage) => {
        const nextLink = lastPage.links.next;
        return nextLink ? getPageNumberFromUrl(nextLink) : undefined;
      },
    }
  );

  // flatten all pages' data
  const projects = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data?.pages]
  );

  // one‐time‐per‐entry guard
  const didFetchRef = useRef(false);

  // sentinel for “load more”
  const { ref: loadMoreRef, inView } = useInView({
    rootMargin: '0px 0px 100px 0px', // fire when 100px from bottom
    threshold: 0, // any pixel visible is enough
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !didFetchRef.current) {
      didFetchRef.current = true;
      fetchNextPage();
    } else if (!inView) {
      // reset when it leaves view so next entry can fetch again
      didFetchRef.current = false;
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, data?.pages]);

  const getSentinelMessage = () => {
    if (isFetchingNextPage) {
      return messages.loadingMore;
    }
    if (hasNextPage) {
      return messages.scrollDownToLoadMore;
    }
    // Only show "All loaded" if the query is done
    if (status === 'success' && !hasNextPage) {
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

      {(isFetching || status === 'loading') && (
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
