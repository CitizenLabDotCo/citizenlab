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

import useInfiniteProjectFoldersAdmin from 'api/project_folders_mini/useInfiniteProjectFoldersAdmin';

import { useInfiniteScroll } from 'hooks/useInfiniteScroll';

import { useIntl } from 'utils/cl-intl';

import projectMessages from '../../Projects/Table/messages';
import { useParams } from '../utils';

import messages from './messages';
import Row from './Row';

const PAGE_SIZE = 10;

const Table = () => {
  const { formatMessage } = useIntl();
  const params = useParams();

  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    status,
  } = useInfiniteProjectFoldersAdmin(
    {
      ...params,
    },
    PAGE_SIZE
  );

  const folders = useMemo(
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
      return projectMessages.loadingMore;
    }
    if (hasNextPage) {
      return projectMessages.scrollDownToLoadMore;
    }

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
