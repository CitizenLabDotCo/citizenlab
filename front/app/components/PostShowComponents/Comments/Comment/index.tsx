// libraries
import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import CommentHeader from './CommentHeader';
import CommentBody from './CommentBody';
import CommentFooter from './CommentFooter';
import { Icon } from '@citizenlab/cl2-component-library';

// services
import { canModerateProject } from 'services/permissions/rules/projectPermissions';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import useComment from 'api/comments/useComment';
import useUserById from 'api/users/useUserById';

const Container = styled.div``;

const ContainerInner = styled.div`
  position: relative;

  &.child {
    margin-top: 20px;
    margin-left: 38px;
  }
`;

const Content = styled.div`
  display: flex;
  margin-left: 39px;
`;

const BodyAndFooter = styled.div`
  flex: 1;
`;

const DeletedComment = styled.div`
  color: ${colors.textSecondary};
  display: flex;
  align-items: center;
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  font-style: italic;
`;

const DeletedIcon = styled(Icon)`
  margin-right: 12px;
  fill: ${colors.textSecondary};
`;

interface Props {
  postId: string;
  postType: 'idea' | 'initiative';
  projectId?: string | null;
  commentId: string;
  commentType: 'parent' | 'child';
  hasChildComments?: boolean;
  last?: boolean;
  className?: string;
}

const Comment = ({
  postId,
  postType,
  projectId,
  commentType,
  commentId,
  hasChildComments,
  last,
  className,
}: Props) => {
  const { data: comment } = useComment(commentId);
  const { data: author } = useUserById(
    comment?.data.relationships?.author?.data?.id
  );

  const [editing, setEditing] = useState(false);

  const onEditing = () => {
    setEditing(true);
  };

  const onCancelEditing = () => {
    setEditing(false);
  };

  const onCommentSaved = () => {
    setEditing(false);
  };

  if (comment) {
    const commentId = comment.data.id;
    const authorId = author ? author.data.id : null;
    const lastComment =
      (commentType === 'parent' && !hasChildComments) ||
      (commentType === 'child' && last === true);
    const moderator =
      !isNilOrError(author) &&
      canModerateProject(projectId, { data: author.data });

    return (
      <Container
        id={commentId}
        className={`${className || ''} ${commentType} ${
          commentType === 'parent' ? 'e2e-parentcomment' : 'e2e-childcomment'
        } e2e-comment`}
      >
        <ContainerInner
          className={`${commentType} ${lastComment ? 'lastComment' : ''}`}
        >
          {comment.data.attributes.publication_status === 'published' && (
            <>
              <CommentHeader
                projectId={projectId}
                authorId={authorId}
                commentId={commentId}
                commentType={commentType}
                commentCreatedAt={comment.data.attributes.created_at}
                moderator={moderator}
                className={commentType === 'parent' ? 'marginBottom' : ''}
              />

              <Content>
                <BodyAndFooter>
                  <CommentBody
                    commentId={commentId}
                    commentType={commentType}
                    editing={editing}
                    onCommentSaved={onCommentSaved}
                    onCancelEditing={onCancelEditing}
                    postId={postId}
                    postType={postType}
                  />
                  <CommentFooter
                    className={commentType}
                    postId={postId}
                    postType={postType}
                    projectId={projectId}
                    commentId={commentId}
                    commentType={commentType}
                    onEditing={onEditing}
                  />
                </BodyAndFooter>
              </Content>
            </>
          )}

          {comment.data.attributes.publication_status === 'deleted' && (
            <DeletedComment>
              <DeletedIcon name="delete" />
              <FormattedMessage {...messages.commentDeletedPlaceholder} />
            </DeletedComment>
          )}
        </ContainerInner>
      </Container>
    );
  }

  return null;
};

export default Comment;
