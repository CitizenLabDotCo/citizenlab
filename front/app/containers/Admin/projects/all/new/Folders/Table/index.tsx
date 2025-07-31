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

import useInfiniteScroll from 'hooks/useInfiniteScroll';

import { useIntl } from 'utils/cl-intl';

import ColHeader from '../../_shared/ColHeader';
import sharedMessages from '../../_shared/messages';
import { useParams } from '../../_shared/params';

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
  } = useInfiniteProjectFoldersAdmin(params, PAGE_SIZE);

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
      return sharedMessages.loadingMore;
    }

    if (hasNextPage) {
      return sharedMessages.scrollDownToLoadMore;
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
            <ColHeader>{formatMessage(messages.folder)}</ColHeader>
            <ColHeader>{formatMessage(messages.managers)}</ColHeader>
            <ColHeader>{formatMessage(messages.status)}</ColHeader>
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
