import React, { useState } from 'react';

import {
  Box,
  colors,
  fontSizes,
  media,
  isRtl,
  Title,
} from '@citizenlab/cl2-component-library';
import { useInView } from 'react-intersection-observer';
import styled from 'styled-components';

import useIdeaById from 'api/ideas/useIdeaById';
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
  className?: string;
}

const InternalCommentsSection = ({ postId, className }: Props) => {
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

  const { data: idea } = useIdeaById(postId);
  const [sortOrder, setSortOrder] = useState<InternalCommentSort>('new');
  const {
    data: comments,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useInternalComments({
    type: 'idea',
    ideaId: postId,
    sort: sortOrder,
  });
  const [posting, setPosting] = useState(false);

  const commentsList = comments?.pages.flatMap((page) => page.data);

  if (!idea || !commentsList) return null;

  const hasComments = idea.data.attributes.internal_comments_count > 0;

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
          <Title variant="h2" color="tenantText" id="comments-main-title">
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
          ideaId={postId}
          postingComment={handleCommentPosting}
        />
      </Box>

      <InternalComments
        ideaId={postId}
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
