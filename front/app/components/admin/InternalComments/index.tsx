import React, { useState } from 'react';

import {
  Box,
  Title,
  colors,
  fontSizes,
  media,
  isRtl,
} from '@citizenlab/cl2-component-library';
import { useInView } from 'react-intersection-observer';
import styled from 'styled-components';

import useIdeaById from 'api/ideas/useIdeaById';
import useInitiativeById from 'api/initiatives/useInitiativeById';
import { InternalCommentSort } from 'api/internal_comments/types';
import useInternalComments from 'api/internal_comments/useInternalComments';

import commentsMessages from 'components/PostShowComponents/Comments/messages';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';

import InternalComments from './InternalComments';
import InternalCommentSorting from './InternalCommentSorting';
import InternalParentCommentForm from './InternalParentCommentForm';
import tracks from './tracks';

const Header = styled(Box)`
  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const StyledCommentSorting = styled(InternalCommentSorting)`
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

const InternalCommentsSection = ({ postId, postType, className }: Props) => {
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
  const initiativeId = postType === 'initiative' ? postId : undefined;
  const ideaId = postType === 'idea' ? postId : undefined;
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: idea } = useIdeaById(ideaId);
  const [sortOrder, setSortOrder] = useState<InternalCommentSort>('new');
  const {
    data: comments,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useInternalComments({
    type: postType,
    ideaId: postId,
    initiativeId: postId,
    sort: sortOrder,
  });
  const [posting, setPosting] = useState(false);

  const commentsList = comments?.pages.flatMap((page) => page.data);
  const post = initiative || idea;

  if (!post || !commentsList) return null;

  const hasComments = post.data.attributes.internal_comments_count > 0;

  const handleSortOrderChange = (sortOrder: InternalCommentSort) => {
    trackEventByName(tracks.clickCommentsSortOrder);
    setSortOrder(sortOrder);
  };

  const handleCommentPosting = (isPosting: boolean) => {
    setPosting(isPosting);
  };

  return (
    <Box className={className || ''}>
      {hasComments && (
        <Header
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mt="16px"
        >
          <Title color="tenantText" styleVariant="h2" id="comments-main-title">
            <FormattedMessage {...commentsMessages.invisibleTitleComments} />
          </Title>
          <StyledCommentSorting
            onChange={handleSortOrderChange}
            selectedCommentSort={sortOrder}
          />
        </Header>
      )}

      <Box my="24px">
        <InternalParentCommentForm
          ideaId={ideaId}
          initiativeId={initiativeId}
          postType={postType}
          postingComment={handleCommentPosting}
        />
      </Box>

      <InternalComments
        ideaId={ideaId}
        initiativeId={initiativeId}
        postType={postType}
        allComments={commentsList}
        loading={isLoading}
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
            <FormattedMessage {...commentsMessages.loadingMoreComments} />
          </LoadingMoreMessage>
        </Box>
      )}
    </Box>
  );
};

export default InternalCommentsSection;
