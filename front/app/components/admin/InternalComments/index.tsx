// libraries
import React, { useState, useCallback } from 'react';
import Observer from '@researchgate/react-intersection-observer';

// components
import ParentCommentForm from './ParentCommentForm';
import Comments from './Comments';
import CommentSorting from './CommentSorting';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import commentsMessages from 'components/PostShowComponents/Comments/messages';

// style
import styled from 'styled-components';
import { colors, fontSizes, media, isRtl } from 'utils/styleUtils';
import { Title } from '@citizenlab/cl2-component-library';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useIdeaById from 'api/ideas/useIdeaById';
import useInternalComments from 'api/internal_comments/useInternalComments';
import { InternalCommentSort } from 'api/internal_comments/types';

const Container = styled.div``;

const StyledParentCommentForm = styled(ParentCommentForm)`
  margin-bottom: 25px;
`;

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

const LoadMore = styled.div`
  width: 100%;
  height: 0px;
`;

const LoadingMore = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
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
  } = useInternalComments({
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
    <Container className={className || ''}>
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

      <StyledParentCommentForm
        ideaId={ideaId}
        initiativeId={initiativeId}
        postType={postType}
        postingComment={handleCommentPosting}
      />

      <Comments
        ideaId={ideaId}
        initiativeId={initiativeId}
        postType={postType}
        allComments={commentsList}
        loading={isLoading}
      />

      {hasNextPage && !isFetchingNextPage && (
        <Observer onChange={handleIntersection} rootMargin="3000px">
          <LoadMore />
        </Observer>
      )}

      {isFetchingNextPage && !posting && (
        <LoadingMore>
          <LoadingMoreMessage>
            <FormattedMessage {...commentsMessages.loadingMoreComments} />
          </LoadingMoreMessage>
        </LoadingMore>
      )}
    </Container>
  );
};

export default CommentsSection;
