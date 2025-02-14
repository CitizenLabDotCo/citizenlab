import React, { useState } from 'react';

import { Icon, colors, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useInternalComment from 'api/internal_comments/useInternalComment';
import useUserById from 'api/users/useUserById';

import commentsMessages from 'components/PostShowComponents/Comments/messages';

import { FormattedMessage } from 'utils/cl-intl';

import InternalCommentBody from './InternalCommentBody';
import InternalCommentFooter from './InternalCommentFooter';
import InternalCommentHeader from './InternalCommentHeader';

const Container = styled.div`
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
  ideaId: string | undefined;
  projectId?: string | null;
  commentId: string;
  commentType: 'parent' | 'child';
  hasChildComments?: boolean;
  last?: boolean;
  className?: string;
}

const InternalComment = ({
  ideaId,
  projectId,
  commentType,
  commentId,
  hasChildComments,
  last,
  className,
}: Props) => {
  const { data: comment } = useInternalComment(commentId);
  const { data: author } = useUserById(
    comment?.data.relationships.author.data?.id
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

    return (
      <Container
        id={commentId}
        className={`
          e2e-comment
          ${className || ''} 
          ${commentType} 
          ${
            commentType === 'parent'
              ? 'e2e-parentcomment'
              : 'e2e-internal-child-comment'
          } 
          ${lastComment ? 'lastComment' : ''}
        `}
      >
        {
          // Don't show deleted comments. Better to have a filter in the BE.
        }
        {comment.data.attributes.publication_status === 'published' && (
          <>
            <InternalCommentHeader
              commentAttributes={comment.data.attributes}
              commentType={commentType}
              className={commentType === 'parent' ? 'marginBottom' : ''}
              authorId={authorId}
            />

            <Content>
              <BodyAndFooter>
                <InternalCommentBody
                  commentId={commentId}
                  commentType={commentType}
                  editing={editing}
                  onCommentSaved={onCommentSaved}
                  onCancelEditing={onCancelEditing}
                  ideaId={ideaId}
                />
                <InternalCommentFooter
                  className={commentType}
                  ideaId={ideaId}
                  projectId={projectId}
                  commentId={commentId}
                  commentType={commentType}
                  onEditing={onEditing}
                  authorId={authorId}
                />
              </BodyAndFooter>
            </Content>
          </>
        )}

        {comment.data.attributes.publication_status === 'deleted' && (
          <DeletedComment>
            <DeletedIcon name="delete" />
            <FormattedMessage {...commentsMessages.commentDeletedPlaceholder} />
          </DeletedComment>
        )}
      </Container>
    );
  }
  return null;
};

export default InternalComment;
