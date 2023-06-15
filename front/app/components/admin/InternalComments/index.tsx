// libraries
import React, { useState, useCallback } from 'react';
import Observer from '@researchgate/react-intersection-observer';

// components
import ParentCommentForm from './ParentCommentForm';
import Comments from './Comments';
import CommentSorting, { InternalCommentSort } from './CommentSorting';
import { Box, Title } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import commentsMessages from 'components/PostShowComponents/Comments/messages';

// style
import styled from 'styled-components';
import { colors, fontSizes, media, isRtl } from 'utils/styleUtils';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useIdeaById from 'api/ideas/useIdeaById';
import useComments from 'api/comments/useComments';

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const CommentCount = styled.span`
  margin-left: 5px;
`;

const StyledCommentSorting = styled(CommentSorting)`
  display: flex;
  justify-content: flex-end;

  ${media.phone`
    justify-content: flex-start;
  `}
`;

const LoadingMoreMessage = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.m}px;
  font-weight: 400;
`;

export interface Props {
  postId: string;
  postType: 'idea' | 'initiative';
  className?: string;
}

const CommentsSection = ({ postId, postType, className }: Props) => {
  const initiativeId = postType === 'initiative' ? postId : undefined;
  const ideaId = postType === 'idea' ? postId : undefined;
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: idea } = useIdeaById(ideaId);
  const [sortOrder, setSortOrder] = useState<InternalCommentSort>('-new');
  const {
    data: comments,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useComments({
    initiativeId: postType === 'initiative' ? postId : undefined,
    ideaId: postType === 'idea' ? postId : undefined,
    sort: sortOrder,
  });
  const [posting, setPosting] = useState(false);

  const commentsList = comments?.pages.flatMap((page) => page.data);
  const post = initiative || idea;

  const handleIntersection = useCallback(
    (event: IntersectionObserverEntry, unobserve: () => void) => {
      if (event.isIntersecting && hasNextPage) {
        fetchNextPage();
        unobserve();
      }
    },
    [fetchNextPage, hasNextPage]
  );

  if (!post || !commentsList) return null;

  const handleSortOrderChange = (sortOrder: InternalCommentSort) => {
    trackEventByName(tracks.clickCommentsSortOrder);
    setSortOrder(sortOrder);
  };

  const handleCommentPosting = (isPosting: boolean) => {
    setPosting(isPosting);
  };

  const commentCount = post.data.attributes.comments_count;

  return (
    <Box className={className || ''}>
      <Header>
        <Title color="tenantText" variant="h2" id="comments-main-title">
          <FormattedMessage {...commentsMessages.invisibleTitleComments} />
          {commentCount > 0 && <CommentCount>({commentCount})</CommentCount>}
        </Title>
        <StyledCommentSorting
          onChange={handleSortOrderChange}
          selectedCommentSort={sortOrder}
        />
      </Header>

      <Box mb="25px">
        <ParentCommentForm
          ideaId={ideaId}
          initiativeId={initiativeId}
          postType={postType}
          postingComment={handleCommentPosting}
        />
      </Box>

      <Comments
        ideaId={ideaId}
        initiativeId={initiativeId}
        postType={postType}
        allComments={commentsList}
        loading={isLoading}
      />

      {hasNextPage && !isFetchingNextPage && (
        <Observer onChange={handleIntersection} rootMargin="3000px">
          <Box w="100%" />
        </Observer>
      )}

      {isFetchingNextPage && !posting && (
        <Box
          w="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mb="30px"
        >
          <LoadingMoreMessage>
            <FormattedMessage {...commentsMessages.loadingMoreComments} />
          </LoadingMoreMessage>
        </Box>
      )}
    </Box>
  );
};

export default CommentsSection;
