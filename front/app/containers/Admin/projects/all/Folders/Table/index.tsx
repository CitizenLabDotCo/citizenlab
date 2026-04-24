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
} from '@citizenlab/cl2-component-library';

import useInfiniteProjectFoldersAdmin from 'api/project_folders_mini/useInfiniteProjectFoldersAdmin';

import useInfiniteScroll from 'hooks/useInfiniteScroll';

import { useIntl } from 'utils/cl-intl';
import { groupIncludedResources } from 'utils/cl-react-query/groupIncludedResources';
import { indexById } from 'utils/cl-react-query/indexById';

import ColHeader from '../../_shared/ColHeader';
import LoadingComponents from '../../_shared/LoadingComponents';
import sharedMessages from '../../_shared/messages';
import { useParams } from '../../_shared/params';

import EmptyRow from './EmptyRow';
import messages from './messages';
import Row from './Row';

const PAGE_SIZE = 10;

const Table = () => {
  const { formatMessage } = useIntl();
  const params = useParams();

  const {
    data,
    isLoading,
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

  const moderatorsById = useMemo(() => {
    const included = data?.pages.flatMap((page) => page.included ?? []) ?? [];
    const moderators = groupIncludedResources(included).user;
    const moderatorsById = moderators ? indexById(moderators) : undefined;
    return moderatorsById;
  }, [data?.pages]);

  // True when loading the initial data,
  // or when loading new (i.e. a new combination of filters) data
  const isLoadingNewData = isLoading || (isFetching && !isFetchingNextPage);
  const isLoadingData = isLoadingNewData || isFetchingNextPage;

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

    if (folders.length === 0 && !isLoadingData) {
      return messages.noFoldersFound;
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
            <ColHeader>{formatMessage(sharedMessages.managers)}</ColHeader>
            <ColHeader>{formatMessage(messages.status)}</ColHeader>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {isLoadingNewData && (
            <>
              <EmptyRow />
              <EmptyRow />
              <EmptyRow />
            </>
          )}
          {!isLoadingNewData &&
            folders.map((folder) => (
              <Row
                key={folder.id}
                folder={folder}
                moderatorsById={moderatorsById}
              />
            ))}
        </Tbody>
      </TableComponent>

      <LoadingComponents
        sentinel={sentinelMessage ? formatMessage(sentinelMessage) : undefined}
        loadMoreRef={loadMoreRef}
        isLoadingNewData={isLoadingNewData}
        isFetchingNextPage={isFetchingNextPage}
      />
    </Box>
  );
};

export default Table;
