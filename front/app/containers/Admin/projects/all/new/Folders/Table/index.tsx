import React, { useEffect, useMemo, useRef } from 'react';

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
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

import { MiniProjectFolders, Parameters } from 'api/project_folders_mini/types';

import { useIntl } from 'utils/cl-intl';
import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import { useParams } from '../utils';

import messages from './messages';
import Row from './Row';

const PAGE_SIZE = 10;

const fetchProjectFoldersAdmin = async (
  queryParams: Parameters
): Promise<MiniProjectFolders> =>
  fetcher<MiniProjectFolders>({
    path: '/project_folders/for_admin',
    action: 'get',
    queryParams: {
      ...queryParams,
      'page[number]': queryParams['page[number]'] ?? 1,
      'page[size]': queryParams['page[size]'] ?? PAGE_SIZE,
    },
  });

const Table = () => {
  const { formatMessage } = useIntl();
  const { ...params } = useParams();
  const didFetchRef = useRef(false);

  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    status,
  } = useInfiniteQuery(
    ['projectFolders', params],
    ({ pageParam = 1 }) =>
      fetchProjectFoldersAdmin({
        ...params,
        'page[number]': pageParam,
        'page[size]': PAGE_SIZE,
      }),
    {
      getNextPageParam: (lastPage) => {
        const nextLink = lastPage.links?.next;
        return nextLink ? getPageNumberFromUrl(nextLink) : undefined;
      },
    }
  );

  // flatten pages into one list
  const folders = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data?.pages]
  );

  // sentinel
  const { ref: loadMoreRef, inView } = useInView({
    rootMargin: '0px 0px 100px 0px',
    threshold: 0,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !didFetchRef.current) {
      didFetchRef.current = true;
      fetchNextPage();
    } else if (!inView) {
      didFetchRef.current = false;
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const getSentinelMessage = () => {
    if (isFetchingNextPage) {
      return messages.loadingMore;
    }
    if (hasNextPage) {
      return messages.scrollDownToLoadMore;
    }
    // Only show "All loaded" if the query is done
    if (status === 'success') {
      return messages.allFoldersHaveLoaded;
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
            <Th py="16px">{formatMessage(messages.folder)}</Th>
            <Th py="16px">{formatMessage(messages.managers)}</Th>
            <Th py="16px">{formatMessage(messages.status)}</Th>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {folders.map((folder) => (
            <Row key={folder.id} folder={folder} />
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
