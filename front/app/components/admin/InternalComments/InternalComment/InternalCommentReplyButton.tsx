import React from 'react';

import { colors, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IInternalCommentData } from 'api/internal_comments/types';
import useUserById from 'api/users/useUserById';

import commentsMessages from 'components/PostShowComponents/Comments/messages';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';

import { commentReplyButtonClicked } from '../events';
import tracks from '../tracks';

const Container = styled.li`
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const ReplyButton = styled.button`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  white-space: nowrap;
  cursor: pointer;
  padding: 0;
  margin: 0;
  border: none;

  &:hover {
    color: #000;
    text-decoration: underline;
  }
`;

interface Props {
  commentType: 'parent' | 'child' | undefined;
  authorId: string | null;
  comment: IInternalCommentData;
  className?: string;
}

const InternalCommentReplyButton = ({
  commentType,
  authorId,
  comment,
  className,
}: Props) => {
  const commentId = comment.id;
  const parentCommentId = comment.relationships.parent.data?.id ?? null;
  const { data: author } = useUserById(authorId);

  const onReply = () => {
    const { clickChildCommentReplyButton, clickParentCommentReplyButton } =
      tracks;

    trackEventByName(
      commentType === 'child'
        ? clickChildCommentReplyButton
        : clickParentCommentReplyButton
    );

    commentReplyButtonClicked({
      commentId,
      parentCommentId,
      authorFirstName: author?.data.attributes.first_name,
      authorLastName: author?.data.attributes.last_name,
      authorSlug: author?.data.attributes.slug,
    });
  };

  const isCommentDeleted = comment.attributes.publication_status === 'deleted';

  if (!isCommentDeleted) {
    return (
      <Container className={`reply ${className || ''}`}>
        <ReplyButton onClick={onReply} className="e2e-comment-reply-button">
          <FormattedMessage {...commentsMessages.commentReplyButton} />
        </ReplyButton>
      </Container>
    );
  }

  return null;
};

export default InternalCommentReplyButton;
