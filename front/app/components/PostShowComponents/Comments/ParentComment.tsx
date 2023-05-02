import React from 'react';
import { get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

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
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useIdeaById from 'api/ideas/useIdeaById';
import useComment from 'api/comments/useComment';
import useComments from 'api/comments/useComments';
import useAuthUser from 'hooks/useAuthUser';
import useInitiativesPermissions from 'hooks/useInitiativesPermissions';

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
  postId: string;
  postType: 'idea' | 'initiative';
  commentId: string;
  childCommentIds: string[] | false;
  className?: string;
}

const ParentComment = ({
  commentId,
  postId,
  postType,
  className,
  childCommentIds,
}: Props) => {
  const commentingPermissionInitiative = useInitiativesPermissions(
    'commenting_initiative'
  );
  const theme = useTheme();
  const authUser = useAuthUser();
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
  const initiativeId = postType === 'initiative' ? postId : undefined;
  const ideaId = postType === 'idea' ? postId : undefined;
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: idea } = useIdeaById(ideaId);
  const post = initiative || idea;

  if (!isNilOrError(comment) && !isNilOrError(post)) {
    const projectId: string | null =
      idea?.data.relationships.project.data.id || null;
    const commentDeleted =
      comment.data.attributes.publication_status === 'deleted';
    const commentingEnabled =
      postType === 'initiative'
        ? commentingPermissionInitiative?.enabled === true
        : get(
            post,
            'attributes.action_descriptor.commenting_idea.enabled',
            true
          );
    const showCommentForm = authUser && commentingEnabled && !commentDeleted;
    const hasChildComments = childCommentIds && childCommentIds.length > 0;
    const modifiedChildCommentIds = !isNilOrError(childComments)
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
            postId={postId}
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
              postId={postId}
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
            postId={postId}
            postType={postType}
            projectId={projectId}
            parentId={commentId}
          />
        )}
      </Container>
    );
  }

  return null;
};

export default ParentComment;
