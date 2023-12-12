import React from 'react';

// components
import InternalCommentReplyButton from './InternalCommentReplyButton';
import InternalCommentsMoreActions from './InternalCommentsMoreActions';

// style
import styled from 'styled-components';
import { colors, fontSizes, isRtl } from '@citizenlab/cl2-component-library';

// hooks
import useInternalComment from 'api/internal_comments/useInternalComment';

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

const StyledCommentReplyButton = styled(InternalCommentReplyButton)`
  height: ${footerHeight};
  margin-top: ${footerTopMargin};
`;

const StyledCommentsMoreActions = styled(InternalCommentsMoreActions)`
  height: ${footerHeight};
  margin-top: ${footerTopMargin};
`;

const Right = styled.div`
  display: flex;
  align-items: center;
`;

interface Props {
  ideaId: string | undefined;
  initiativeId: string | undefined;
  projectId?: string | null;
  commentId: string;
  commentType: 'parent' | 'child';
  onEditing: () => void;
  className?: string;
  authorId: string | null;
}

const InternalCommentFooter = ({
  onEditing,
  commentType,
  ideaId,
  initiativeId,
  projectId,
  commentId,
  className,
  authorId,
}: Props) => {
  const { data: comment } = useInternalComment(commentId);

  if (!comment) {
    return null;
  }

  return (
    <Container className={className || ''}>
      <Left>
        <StyledCommentReplyButton
          commentType={commentType}
          authorId={authorId}
          comment={comment.data}
        />
      </Left>
      <Right>
        <StyledCommentsMoreActions
          projectId={projectId}
          comment={comment.data}
          onCommentEdit={onEditing}
          ideaId={ideaId}
          initiativeId={initiativeId}
        />
      </Right>
    </Container>
  );
};

export default InternalCommentFooter;
