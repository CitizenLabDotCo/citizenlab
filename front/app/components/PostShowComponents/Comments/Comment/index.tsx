import React, { useState } from 'react';

import { Icon, colors, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useComment from 'api/comments/useComment';
import useProjectById from 'api/projects/useProjectById';
import useUserById from 'api/users/useUserById';

import { FormattedMessage } from 'utils/cl-intl';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import messages from '../messages';

import CommentBody from './CommentBody';
import CommentFooter from './CommentFooter';
import CommentHeader from './CommentHeader';

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
  projectId?: string | null;
  commentId: string;
  commentType: 'parent' | 'child';
  hasChildComments?: boolean;
  last?: boolean;
  className?: string;
}

const Comment = ({
  ideaId,
  projectId,
  commentType,
  commentId,
  hasChildComments,
  last,
  className,
}: Props) => {
  const { data: comment } = useComment(commentId);
  const { data: author } = useUserById(
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    comment?.data.relationships?.author?.data?.id
  );
  const { data: project } = useProjectById(projectId);

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

  const authorCanModerate = author
    ? project
      ? canModerateProject(project.data, author)
      : false
    : false;

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
              <CommentHeader
                commentAttributes={comment.data.attributes}
                commentType={commentType}
                className={commentType === 'parent' ? 'marginBottom' : ''}
                authorId={authorId}
                userCanModerate={authorCanModerate}
              />

              <Content>
                <BodyAndFooter>
                  <CommentBody
                    commentId={commentId}
                    commentType={commentType}
                    editing={editing}
                    onCommentSaved={onCommentSaved}
                    onCancelEditing={onCancelEditing}
                    ideaId={ideaId}
                  />
                  <CommentFooter
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
