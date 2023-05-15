// libraries
import React, { memo, useState, useCallback } from 'react';
import Observer from '@researchgate/react-intersection-observer';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import ParentCommentForm from './ParentCommentForm';
import Comments from './Comments';
import CommentingDisabled from './CommentingDisabled';
import CommentSorting from './CommentSorting';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors, fontSizes, media, isRtl } from 'utils/styleUtils';
import { Title } from '@citizenlab/cl2-component-library';

// typings
import { CommentsSort } from 'api/comments/types';
import CommentingInitiativeDisabled from './CommentingInitiativeDisabled';
import { IIdea } from 'api/ideas/types';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useProjectById from 'api/projects/useProjectById';
import useIdeaById from 'api/ideas/useIdeaById';
import useComments from 'api/comments/useComments';

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

const CommentsSection = memo<Props>(({ postId, postType, className }) => {
  const initiativeId = postType === 'initiative' ? postId : undefined;
  const ideaId = postType === 'idea' ? postId : undefined;
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: idea } = useIdeaById(ideaId);
  const [sortOrder, setSortOrder] = useState<CommentsSort>('-new');
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

  const commentsList = comments?.pages.flatMap((page) => page.data);

  const post = initiative || idea;
  const projectId = idea?.data.relationships?.project.data.id;
  const { data: project } = useProjectById(projectId);

  const [posting, setPosting] = useState(false);

  const handleSortOrderChange = useCallback((sortOrder: CommentsSort) => {
    trackEventByName(tracks.clickCommentsSortOrder);
    setSortOrder(sortOrder);
  }, []);

  const handleIntersection = useCallback(
    (event: IntersectionObserverEntry, unobserve: () => void) => {
      if (event.isIntersecting && hasNextPage) {
        fetchNextPage();
        unobserve();
      }
    },
    [fetchNextPage, hasNextPage]
  );

  const handleCommentPosting = useCallback((isPosting: boolean) => {
    setPosting(isPosting);
  }, []);

  if (!isNilOrError(post) && !isNilOrError(commentsList)) {
    const phaseId = project?.data.relationships?.current_phase?.data?.id;
    const commentCount = post.data.attributes.comments_count;

    return (
      <Container className={className || ''}>
        <Header>
          <Title color="tenantText" variant="h2" id="comments-main-title">
            <FormattedMessage {...messages.invisibleTitleComments} />
            {commentCount > 0 && <CommentCount>({commentCount})</CommentCount>}
          </Title>
          <StyledCommentSorting
            onChange={handleSortOrderChange}
            selectedValue={[sortOrder]}
          />
        </Header>

        {postType === 'idea' && idea ? (
          <CommentingIdeaDisabled idea={idea} phaseId={phaseId} />
        ) : (
          <CommentingInitiativeDisabled />
        )}

        <StyledParentCommentForm
          postId={postId}
          postType={postType}
          postingComment={handleCommentPosting}
        />

        <Comments
          postId={postId}
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
              <FormattedMessage {...messages.loadingMoreComments} />
            </LoadingMoreMessage>
          </LoadingMore>
        )}
      </Container>
    );
  }

  return null;
});

const CommentingIdeaDisabled = ({
  idea,
  phaseId,
}: {
  idea: IIdea;
  phaseId?: string;
}) => {
  const actionDescriptor =
    idea.data.attributes.action_descriptor.commenting_idea;

  const commentingEnabled = actionDescriptor.enabled;
  const commentingDisabledReason = actionDescriptor.disabled_reason;

  return (
    <CommentingDisabled
      commentingEnabled={!!commentingEnabled}
      commentingDisabledReason={commentingDisabledReason}
      projectId={idea?.data.relationships.project.data.id || null}
      phaseId={phaseId}
    />
  );
};

export default CommentsSection;
