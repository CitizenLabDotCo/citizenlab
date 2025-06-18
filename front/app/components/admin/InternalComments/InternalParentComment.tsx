import React from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import { useLocation } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

import useIdeaById from 'api/ideas/useIdeaById';
import useInternalComment from 'api/internal_comments/useInternalComment';
import useInternalComments from 'api/internal_comments/useInternalComments';

import Highlighter from 'components/Highlighter';
import commentsMessages from 'components/PostShowComponents/Comments/messages';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import InternalChildCommentForm from './InternalChildCommentForm';
import InternalComment from './InternalComment';

const Container = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const ParentCommentContainer = styled.div`
  position: relative;
`;

const StyledChildCommentForm = styled(InternalChildCommentForm)`
  margin-top: 30px;
  margin-left: 38px;
`;

const LoadMoreButton = styled(ButtonWithLink)`
  margin-top: 20px;
  margin-left: 38px;
`;

interface Props {
  ideaId: string | undefined;
  commentId: string;
  childCommentIds: string[];
  className?: string;
}

const InternalParentComment = ({
  commentId,
  ideaId,
  className,
  childCommentIds,
}: Props) => {
  const theme = useTheme();
  const { data: comment } = useInternalComment(commentId);
  const { hash } = useLocation();
  const {
    data: childCommentsData,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useInternalComments({
    type: 'comment',
    commentId,
    pageSize: !hash ? 5 : undefined,
  });
  const childComments = childCommentsData?.pages
    .map((page) => page.data)
    .flat();
  const { data: idea } = useIdeaById(ideaId);

  if (comment) {
    const projectId = idea?.data.relationships.project.data.id || null;
    const commentDeleted =
      comment.data.attributes.publication_status === 'deleted';
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const hasChildComments = childCommentIds && childCommentIds.length > 0;
    const modifiedChildCommentIds = childComments
      ? childComments
          .filter(
            (comment) => comment.attributes.publication_status !== 'deleted'
          )
          .map((comment) => comment.id)
      : childCommentIds;

    // hide parent comments that are deleted when they have no children
    if (
      comment.data.attributes.publication_status === 'deleted' &&
      !hasChildComments
    ) {
      return null;
    }

    return (
      <Container className={`${className || ''} e2e-parent-and-childcomments`}>
        <ParentCommentContainer className={commentDeleted ? 'deleted' : ''}>
          <Highlighter fragmentId={commentId}>
            <InternalComment
              ideaId={ideaId}
              projectId={projectId}
              commentId={commentId}
              commentType="parent"
              hasChildComments={hasChildComments}
            />
          </Highlighter>
        </ParentCommentContainer>

        {hasNextPage && (
          <LoadMoreButton
            onClick={() => fetchNextPage()}
            className={!isFetchingNextPage ? 'clickable' : ''}
            disabled={isFetchingNextPage}
            bgColor="white"
            textColor={theme.colors.tenantText}
            bgHoverColor="white"
            textHoverColor={darken(0.1, theme.colors.tenantText)}
            fontWeight="bold"
            borderColor="#E0E0E0"
            borderThickness="2px"
          >
            {!isFetchingNextPage ? (
              <FormattedMessage {...commentsMessages.loadMoreComments} />
            ) : (
              <Spinner size="25px" />
            )}
          </LoadMoreButton>
        )}

        {modifiedChildCommentIds.length > 0 &&
          modifiedChildCommentIds.map((childCommentId, index) => (
            <Highlighter fragmentId={childCommentId} key={childCommentId}>
              <InternalComment
                ideaId={ideaId}
                projectId={projectId}
                commentId={childCommentId}
                commentType="child"
                last={index === modifiedChildCommentIds.length - 1}
              />
            </Highlighter>
          ))}

        <StyledChildCommentForm
          ideaId={ideaId}
          projectId={projectId}
          parentId={commentId}
        />
      </Container>
    );
  }

  return null;
};

export default InternalParentComment;
