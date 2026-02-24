import React, { useState, useEffect } from 'react';

import {
  colors,
  fontSizes,
  isRtl,
  Box,
  useBreakpoint,
  Title,
} from '@citizenlab/cl2-component-library';
import { useInView } from 'react-intersection-observer';
import { useLocation } from 'utils/router';
import styled from 'styled-components';

import { CommentsSort } from 'api/comments/types';
import useComments from 'api/comments/useComments';
import useIdeaById from 'api/ideas/useIdeaById';
import useProjectById from 'api/projects/useProjectById';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';
import { isPage } from 'utils/helperUtils';

import messages from '../../messages';
import tracks from '../../tracks';

import CommentingIdeaDisabled from './CommentingIdeaDisabled';
import Comments from './Comments';
import CommentSorting from './CommentSorting';
import ParentCommentForm from './ParentCommentForm';

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
  className?: string;
  allowAnonymousParticipation?: boolean;
  onUnauthenticatedCommentClick?: () => void;
}

const PublicComments = ({
  postId,
  className,
  allowAnonymousParticipation,
  onUnauthenticatedCommentClick,
}: Props) => {
  const { ref: loadMoreRef, inView } = useInView({
    rootMargin: '200px',
    threshold: 0,
  });
  const isSmallerThanPhone = useBreakpoint('phone');

  const { data: idea } = useIdeaById(postId);
  const { pathname } = useLocation();
  const [sortOrder, setSortOrder] = useState<CommentsSort>('new');
  const {
    data: comments,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useComments({
    ideaId: postId,
    sort: sortOrder,
    pageSize: 10,
  });

  const commentsList = comments?.pages.flatMap((page) => page.data);

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const projectId = idea?.data.relationships?.project.data.id;
  const { data: project } = useProjectById(projectId);

  const [posting, setPosting] = useState(false);

  // Trigger fetching of next page when the user scrolls to the bottom
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (!idea || !commentsList) return null;

  const handleSortOrderChange = (sortOrder: CommentsSort) => {
    trackEventByName(tracks.clickCommentsSortOrder);
    setSortOrder(sortOrder);
  };

  const handleCommentPosting = (isPosting: boolean) => {
    setPosting(isPosting);
  };

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const phaseId = project?.data.relationships?.current_phase?.data?.id;
  const commentCount = idea.data.attributes.comments_count;
  const hasComments = commentCount > 0;
  const isAdminPage = isPage('admin', pathname);
  const showCommentCount = !isAdminPage && hasComments;
  const showHeader = !isAdminPage || hasComments;
  const canComment =
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    !idea?.data.attributes.action_descriptors.commenting_idea.disabled_reason;

  return (
    <Box className={className || ''}>
      {showHeader && (
        <Header
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          mt="16px"
        >
          <Title
            variant="h2"
            color="tenantText"
            fontSize={isSmallerThanPhone ? 'xl' : 'xxl'}
            id="comments-main-title"
          >
            <FormattedMessage {...messages.invisibleTitleComments} />
            {showCommentCount && <CommentCount>({commentCount})</CommentCount>}
          </Title>

          <CommentingIdeaDisabled
            idea={idea}
            phaseId={phaseId}
            onUnauthenticatedClick={onUnauthenticatedCommentClick}
          />

          {hasComments && (
            <Box ml="auto" mb="24px">
              <CommentSorting
                onChange={handleSortOrderChange}
                selectedCommentSort={sortOrder}
              />
            </Box>
          )}
        </Header>
      )}
      {canComment && (
        <Box mb="24px">
          <ParentCommentForm
            ideaId={postId}
            postingComment={handleCommentPosting}
            allowAnonymousParticipation={allowAnonymousParticipation}
          />
        </Box>
      )}
      <Comments
        ideaId={postId}
        allComments={commentsList}
        loading={isLoading}
        allowAnonymousParticipation={allowAnonymousParticipation}
      />

      {hasNextPage && !isFetchingNextPage && (
        <Box ref={loadMoreRef} w="100%" h="50px" />
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
