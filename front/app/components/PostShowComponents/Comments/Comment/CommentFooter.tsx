import React from 'react';

import { colors, fontSizes, isRtl } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useComment from 'api/comments/useComment';
import useIdeaById from 'api/ideas/useIdeaById';

import Outlet from 'components/Outlet';

import { isNilOrError } from 'utils/helperUtils';

import CommentReaction from './CommentReaction';
import CommentReplyButton from './CommentReplyButton';
import CommentsMoreActions from './CommentsMoreActions';

const footerHeight = '30px';
const footerTopMargin = '6px';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const Left = styled.ul`
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;

  & li {
    margin-right: 12px;

    &:after {
      color: ${colors.textSecondary};
      font-size: ${fontSizes.s}px;
      font-weight: 400;
      content: '•';
      margin-left: 12px;
    }

    ${isRtl`
        margin-left: 12px;
        margin-right: auto;

        &:after {
          margin-right: 12px;
        }

    `}

    &:last-child {
      &:after,
      &:before {
        margin-left: 0px;
        margin-right: 0px;
        content: '';
      }
    }
  }
`;

const StyledCommentReaction = styled(CommentReaction)`
  height: ${footerHeight};
  margin-top: ${footerTopMargin};
`;

const StyledCommentReplyButton = styled(CommentReplyButton)`
  height: ${footerHeight};
  margin-top: ${footerTopMargin};
`;

const StyledCommentsMoreActions = styled(CommentsMoreActions)`
  height: ${footerHeight};
  margin-top: ${footerTopMargin};
`;

const Right = styled.div`
  display: flex;
  align-items: center;
`;

interface Props {
  ideaId: string | undefined;
  projectId?: string | null;
  commentId: string;
  commentType: 'parent' | 'child';
  onEditing: () => void;
  className?: string;
  authorId: string | null;
}

const CommentFooter = ({
  onEditing,
  commentType,
  ideaId,
  projectId,
  commentId,
  className,
  authorId,
}: Props) => {
  const { data: comment } = useComment(commentId);
  const { data: idea } = useIdeaById(ideaId);

  if (isNilOrError(comment)) {
    return null;
  }

  return (
    <Container className={className || ''}>
      <Left>
        <StyledCommentReaction
          ideaId={ideaId}
          comment={comment.data}
          commentType={commentType}
        />
        <StyledCommentReplyButton
          commentId={commentId}
          commentType={commentType}
          authorId={authorId}
          idea={idea?.data}
          comment={comment.data}
        />
        <Outlet
          id="app.components.PostShowComponents.CommentFooter.left"
          commentId={commentId}
        />
      </Left>
      <Right>
        <StyledCommentsMoreActions
          projectId={projectId}
          comment={comment.data}
          onCommentEdit={onEditing}
          ideaId={ideaId}
        />
      </Right>
    </Container>
  );
};

export default CommentFooter;
