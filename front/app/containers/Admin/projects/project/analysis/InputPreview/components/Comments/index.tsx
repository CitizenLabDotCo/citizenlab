import React, { useMemo, useEffect } from 'react';

import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
import { useInView } from 'react-intersection-observer';
import { useParams } from 'react-router-dom';

import useAnalysisInput from 'api/analysis_inputs/useAnalysisInput';
import useComments from 'api/comments/useComments';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

import { useSelectedInputContext } from '../../../SelectedInputContext';

import messages from './messages';
import Summary from './Summary';
import TopLevelComment from './TopLevelComment';

const Comments = () => {
  const { formatMessage } = useIntl();
  const { selectedInputId } = useSelectedInputContext();
  const { ref: loadMoreRef, inView } = useInView({
    rootMargin: '200px',
    threshold: 0,
  });

  const analysisActive = useFeatureFlag({
    name: 'analysis',
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

  const { analysisId } = useParams() as { analysisId: string };
  const { data: input } = useAnalysisInput(
    analysisId,
    selectedInputId ?? undefined
  );
  const commentsCount = input?.data.attributes.comments_count;

  // The way this is set up is kind of silly. Basically, we fetch all comments (not just the top-level ones).
  // Then we loop over these top-level comments, and for each comment we make another request for the child comments. But part of the child comments were already included in the original request for the top level comments, which is why we filter them out here... so yeah, pretty inefficient and unnecessary way of doing this.
  // So why did I do it like this? Because this is exactly how it works on the idea page.
  // We can fix it here once we fix it there. We decided it was out of scope for this tandem.
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

  if (!selectedInputId) return null;

  return (
    <Box>
      <Title variant="h4">
        {formatMessage(messages.comments)} ({commentsCount})
      </Title>
      {analysisActive && (
        <Box>
          {(commentsCount || 0) >= 5 ? (
            <Summary analysisId={analysisId} inputId={selectedInputId} />
          ) : (
            <Warning>
              {formatMessage(messages.commentsSummaryVisibilityExplanation)}
            </Warning>
          )}
        </Box>
      )}
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
