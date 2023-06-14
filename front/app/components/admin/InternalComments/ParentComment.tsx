import React from 'react';

// components
import Comment from './Comment';
import ChildCommentForm from './ChildCommentForm';
import { Spinner } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled, { useTheme } from 'styled-components';
import { darken } from 'polished';

// hooks
import useIdeaById from 'api/ideas/useIdeaById';
import useComment from 'api/comments/useComment';
import useComments from 'api/comments/useComments';

const Container = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const ParentCommentContainer = styled.div`
  position: relative;
`;

const StyledChildCommentForm = styled(ChildCommentForm)`
  margin-top: 30px;
  margin-left: 38px;
`;

const LoadMoreButton = styled(Button)`
  margin-top: 20px;
  margin-left: 38px;
`;

interface Props {
  ideaId: string | undefined;
  initiativeId: string | undefined;
  postType: 'idea' | 'initiative';
  commentId: string;
  childCommentIds: string[] | false;
  className?: string;
  allowAnonymousParticipation?: boolean;
}

const ParentComment = ({
  commentId,
  ideaId,
  initiativeId,
  postType,
  className,
  childCommentIds,
  allowAnonymousParticipation,
}: Props) => {
  const theme = useTheme();
  const { data: comment } = useComment(commentId);
  const {
    data: childCommentsData,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useComments({ commentId, pageSize: 5 });
  const childComments = childCommentsData?.pages
    .map((page) => page.data)
    .flat();
  const { data: idea } = useIdeaById(ideaId);

  if (comment) {
    const projectId = idea?.data.relationships.project.data.id || null;
    const commentDeleted =
      comment.data.attributes.publication_status === 'deleted';
    const showCommentForm = !commentDeleted;
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
          <Comment
            ideaId={ideaId}
            initiativeId={initiativeId}
            postType={postType}
            projectId={projectId}
            commentId={commentId}
            commentType="parent"
            hasChildComments={hasChildComments}
          />
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
              <FormattedMessage {...messages.loadMoreComments} />
            ) : (
              <Spinner size="25px" />
            )}
          </LoadMoreButton>
        )}

        {modifiedChildCommentIds &&
          modifiedChildCommentIds.length > 0 &&
          modifiedChildCommentIds.map((childCommentId, index) => (
            <Comment
              ideaId={ideaId}
              initiativeId={initiativeId}
              postType={postType}
              projectId={projectId}
              key={childCommentId}
              commentId={childCommentId}
              commentType="child"
              last={index === modifiedChildCommentIds.length - 1}
            />
          ))}

        {showCommentForm && (
          <StyledChildCommentForm
            ideaId={ideaId}
            initiativeId={initiativeId}
            postType={postType}
            projectId={projectId}
            parentId={commentId}
            allowAnonymousParticipation={allowAnonymousParticipation}
          />
        )}
      </Container>
    );
  }

  return null;
};

export default ParentComment;
