// libraries
import React, { useState } from 'react';

// components
import InternalCommentHeader from './InternalCommentHeader';
import InternalCommentBody from './InternalCommentBody';
import InternalCommentFooter from './InternalCommentFooter';
import { Icon } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import commentsMessages from 'components/PostShowComponents/Comments/messages';

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
  ideaId: string | undefined;
  initiativeId: string | undefined;
  projectId?: string | null;
  commentId: string;
  commentType: 'parent' | 'child';
  hasChildComments?: boolean;
  last?: boolean;
  className?: string;
}

const InternalComment = ({
  ideaId,
  initiativeId,
  projectId,
  commentType,
  commentId,
  hasChildComments,
  last,
  className,
}: Props) => {
  const { data: comment } = useComment(commentId);
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
        className={`${className || ''} ${commentType} ${
          commentType === 'parent' ? 'e2e-parentcomment' : 'e2e-childcomment'
        } e2e-comment`}
      >
        <ContainerInner
          className={`${commentType} ${lastComment ? 'lastComment' : ''}`}
        >
          {
            // Don't show deleted comments. Better to have a filter in the BE.
          }
          {comment.data.attributes.publication_status === 'published' && (
            <>
              <InternalCommentHeader
                projectId={projectId}
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
                    initiativeId={initiativeId}
                  />
                  <InternalCommentFooter
                    className={commentType}
                    ideaId={ideaId}
                    initiativeId={initiativeId}
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
              <FormattedMessage
                {...commentsMessages.commentDeletedPlaceholder}
              />
            </DeletedComment>
          )}
        </ContainerInner>
      </Container>
    );
  }
  return null;
};

export default InternalComment;
