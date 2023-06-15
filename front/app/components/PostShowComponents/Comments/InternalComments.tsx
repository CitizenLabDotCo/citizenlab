// libraries
import React, { useState, useCallback } from 'react';
import Observer from '@researchgate/react-intersection-observer';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import ParentCommentForm from './ParentCommentForm';
import Comments from './Comments';
import CommentSorting from './CommentSorting';
import { Box } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors, fontSizes, media, isRtl } from 'utils/styleUtils';
import { Title } from '@citizenlab/cl2-component-library';

// typings
import { CommentsSort } from 'api/comments/types';
import CommentingProposalDisabled from './CommentingProposalDisabled';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useProjectById from 'api/projects/useProjectById';
import useIdeaById from 'api/ideas/useIdeaById';
import useComments from 'api/comments/useComments';
import CommentingIdeaDisabled from './CommetingIdeaDisabled';

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

const LoadingMoreMessage = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.m}px;
  font-weight: 400;
`;

export interface Props {
  postId: string;
  postType: 'idea' | 'initiative';
  className?: string;
  allowAnonymousParticipation?: boolean;
}

const InternalComments = ({
  postId,
  postType,
  className,
  allowAnonymousParticipation,
}: Props) => {
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

  const handleSortOrderChange = (sortOrder: CommentsSort) => {
    trackEventByName(tracks.clickCommentsSortOrder);
    setSortOrder(sortOrder);
  };

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
      <Box className={className || ''}>
        <Header>
          <Title color="tenantText" variant="h2" id="comments-main-title">
            <FormattedMessage {...messages.invisibleTitleComments} />
            {commentCount > 0 && <CommentCount>({commentCount})</CommentCount>}
          </Title>
          <StyledCommentSorting
            onChange={handleSortOrderChange}
            selectedCommentSort={sortOrder}
          />
        </Header>

        {postType === 'idea' && idea ? (
          <CommentingIdeaDisabled idea={idea} phaseId={phaseId} />
        ) : (
          <CommentingProposalDisabled />
        )}

        <StyledParentCommentForm
          ideaId={ideaId}
          initiativeId={initiativeId}
          postType={postType}
          postingComment={handleCommentPosting}
          allowAnonymousParticipation={allowAnonymousParticipation}
        />

        <Comments
          ideaId={ideaId}
          initiativeId={initiativeId}
          postType={postType}
          allComments={commentsList}
          loading={isLoading}
          allowAnonymousParticipation={allowAnonymousParticipation}
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
              <FormattedMessage {...messages.loadingMoreComments} />
            </LoadingMoreMessage>
          </Box>
        )}
      </Box>
    );
  }

  return null;
};

export default InternalComments;
