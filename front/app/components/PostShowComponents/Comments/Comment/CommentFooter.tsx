import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import CommentVote from './CommentVote';
import CommentReplyButton from './CommentReplyButton';
import CommentsMoreActions from './CommentsMoreActions';

// style
import styled from 'styled-components';
import { colors, fontSizes, isRtl } from 'utils/styleUtils';
import Outlet from 'components/Outlet';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useIdeaById from 'api/ideas/useIdeaById';
import useUserById from 'api/users/useUserById';
import useComment from 'api/comments/useComment';
import useInitiativesPermissions from 'hooks/useInitiativesPermissions';

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

const StyledCommentVote = styled(CommentVote)`
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
  postId: string;
  postType: 'idea' | 'initiative';
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
  postId,
  postType,
  projectId,
  commentId,
  className,
  authorId,
}: Props) => {
  const { data: comment } = useComment(commentId);
  const { data: author } = useUserById(authorId);
  const initiativeId = postType === 'initiative' ? postId : undefined;
  const ideaId = postType === 'idea' ? postId : undefined;
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: idea } = useIdeaById(ideaId);
  const post = postType === 'idea' ? idea?.data : initiative?.data;
  const commentingPermissionInitiative = useInitiativesPermissions(
    'commenting_initiative'
  );

  if (isNilOrError(post) || isNilOrError(comment)) {
    return null;
  }

  return (
    <Container className={className || ''}>
      <Left>
        <StyledCommentVote
          postId={postId}
          postType={postType}
          comment={comment.data}
          commentType={commentType}
        />
        <StyledCommentReplyButton
          postId={postId}
          postType={postType}
          commentId={commentId}
          commentType={commentType}
          author={author?.data}
          post={post}
          comment={comment.data}
          commentingPermissionInitiative={commentingPermissionInitiative}
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
          postId={postId}
          postType={postType}
        />
      </Right>
    </Container>
  );
};

export default CommentFooter;
