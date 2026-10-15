import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import useInfiniteScroll from 'hooks/useInfiniteScroll';

import { useIntl } from 'utils/cl-intl';

import sharedMessages from '../../_shared/messages';

interface Props {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

// Loads the next page when it scrolls into view.
const LoadMore = ({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: Props) => {
  const { formatMessage } = useIntl();
  const { loadMoreRef } = useInfiniteScroll({
    isLoading: isFetchingNextPage,
    hasNextPage,
    onLoadMore: fetchNextPage,
    rootMargin: '0px 0px 200px 0px',
  });

  if (!hasNextPage) return null;

  return (
    <div ref={loadMoreRef}>
      <Text variant="boMicro" color="coolGrey500" textAlign="center" py="16px">
        {formatMessage(sharedMessages.loadingMore)}
      </Text>
    </div>
  );
};

export default LoadMore;
