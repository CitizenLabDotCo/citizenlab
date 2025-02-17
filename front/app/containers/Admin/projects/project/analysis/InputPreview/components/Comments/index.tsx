import React, { useMemo, useEffect } from 'react';

import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
import { useInView } from 'react-intersection-observer';

import useComments from 'api/comments/useComments';

import { useIntl } from 'utils/cl-intl';

import { useSelectedInputContext } from '../../../SelectedInputContext';

import messages from './messages';
import TopLevelComment from './TopLevelComment';

const Comments = () => {
  const { formatMessage } = useIntl();
  const { selectedInputId } = useSelectedInputContext();
  const { ref: loadMoreRef, inView } = useInView({
    rootMargin: '200px',
    threshold: 0,
  });

  const {
    data: comments,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useComments({
    ideaId: selectedInputId ?? undefined,
    pageSize: 5,
  });

  const topLevelComments = useMemo(() => {
    if (!comments) return;
    const commentsList = comments.pages.flatMap((page) => page.data);
    return commentsList.filter((comment) => !comment.relationships.parent.data);
  }, [comments]);

  // Trigger fetching of next page when the user scrolls to the bottom
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <Box>
      <Title variant="h4">{formatMessage(messages.comments)}</Title>
      <Box>
        {topLevelComments?.map((comment) => (
          <TopLevelComment key={comment.id} comment={comment} />
        ))}
      </Box>
      {hasNextPage && !isFetchingNextPage && (
        <Box ref={loadMoreRef} w="100%" h="50px" />
      )}
      {isFetchingNextPage && (
        <Box my="24px">
          <Spinner />
        </Box>
      )}
    </Box>
  );
};

export default Comments;
