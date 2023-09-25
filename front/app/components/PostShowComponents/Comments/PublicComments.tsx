// libraries
import React, { useState, useCallback } from 'react';
import Observer from '@researchgate/react-intersection-observer';
import { useLocation } from 'react-router-dom';

// components
import ParentCommentForm from './ParentCommentForm';
import Comments from './Comments';
import CommentSorting from './CommentSorting';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors, fontSizes, isRtl } from 'utils/styleUtils';
import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';

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
import CommentingIdeaDisabled from './CommentingIdeaDisabled';

// utils
import { isPage } from 'utils/helperUtils';

const Header = styled(Box)`
  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const CommentCount = styled.span`
  margin-left: 5px;
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

const PublicComments = ({
  postId,
  postType,
  className,
  allowAnonymousParticipation,
}: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');
  const initiativeId = postType === 'initiative' ? postId : undefined;
  const ideaId = postType === 'idea' ? postId : undefined;
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: idea } = useIdeaById(ideaId);
  const { pathname } = useLocation();
  const [sortOrder, setSortOrder] = useState<CommentsSort>('new');
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

  const handleSortOrderChange = (sortOrder: CommentsSort) => {
    trackEventByName(tracks.clickCommentsSortOrder);
    setSortOrder(sortOrder);
  };

  const handleCommentPosting = (isPosting: boolean) => {
    setPosting(isPosting);
  };

  const phaseId = project?.data.relationships?.current_phase?.data?.id;
  const commentCount = post.data.attributes.comments_count;
  const hasComments = commentCount > 0;
  const isAdminPage = isPage('admin', pathname);
  const showCommentCount = !isAdminPage && hasComments;
  const showHeader = !isAdminPage || hasComments;

  return (
    <Box className={className || ''}>
      {showHeader && (
        <Header
          display="flex"
          flexDirection={isSmallerThanPhone ? 'column' : 'row'}
          alignItems={isSmallerThanPhone ? 'initial' : 'center'}
          justifyContent="space-between"
          mt="16px"
        >
          <Title
            color="tenantText"
            variant="h2"
            fontSize={isSmallerThanPhone ? 'xl' : 'xxl'}
            id="comments-main-title"
          >
            <FormattedMessage {...messages.invisibleTitleComments} />
            {showCommentCount && <CommentCount>({commentCount})</CommentCount>}
          </Title>
          {hasComments && (
            <Box ml="auto">
              <CommentSorting
                onChange={handleSortOrderChange}
                selectedCommentSort={sortOrder}
              />
            </Box>
          )}
        </Header>
      )}

      {postType === 'idea' && idea ? (
        <CommentingIdeaDisabled idea={idea} phaseId={phaseId} />
      ) : (
        <CommentingProposalDisabled />
      )}

      <Box my="24px">
        <ParentCommentForm
          ideaId={ideaId}
          initiativeId={initiativeId}
          postType={postType}
          postingComment={handleCommentPosting}
          allowAnonymousParticipation={allowAnonymousParticipation}
        />
      </Box>

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
};

export default PublicComments;
