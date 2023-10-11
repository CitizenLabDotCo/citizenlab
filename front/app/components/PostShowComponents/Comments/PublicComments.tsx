// libraries
import React, { useState } from 'react';
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
import useInitiativesPermissions from 'hooks/useInitiativesPermissions';
import { useInView } from 'react-intersection-observer';

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
  const { ref } = useInView({
    rootMargin: '3000px',
    onChange: (inView) => {
      if (inView) {
        if (hasNextPage) {
          fetchNextPage();
        }
      }
    },
  });
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
  const commentingPermissionInitiative = useInitiativesPermissions(
    'commenting_initiative'
  );

  const commentsList = comments?.pages.flatMap((page) => page.data);

  const post = initiative || idea;
  const projectId = idea?.data.relationships?.project.data.id;
  const { data: project } = useProjectById(projectId);

  const [posting, setPosting] = useState(false);

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
  const canComment = {
    idea: !idea?.data.attributes.action_descriptor.commenting_idea
      .disabled_reason,
    initiative:
      !commentingPermissionInitiative?.disabledReason &&
      !commentingPermissionInitiative?.authenticationRequirements,
  }[postType];

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
            color="tenantText"
            variant="h2"
            fontSize={isSmallerThanPhone ? 'xl' : 'xxl'}
            id="comments-main-title"
          >
            <FormattedMessage {...messages.invisibleTitleComments} />
            {showCommentCount && <CommentCount>({commentCount})</CommentCount>}
          </Title>
          {postType === 'idea' && idea ? (
            <CommentingIdeaDisabled idea={idea} phaseId={phaseId} />
          ) : (
            <CommentingProposalDisabled />
          )}
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
            ideaId={ideaId}
            initiativeId={initiativeId}
            postType={postType}
            postingComment={handleCommentPosting}
            allowAnonymousParticipation={allowAnonymousParticipation}
          />
        </Box>
      )}
      <Comments
        ideaId={ideaId}
        initiativeId={initiativeId}
        postType={postType}
        allComments={commentsList}
        loading={isLoading}
        allowAnonymousParticipation={allowAnonymousParticipation}
      />

      {hasNextPage && !isFetchingNextPage && <Box ref={ref} w="100%" />}

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
