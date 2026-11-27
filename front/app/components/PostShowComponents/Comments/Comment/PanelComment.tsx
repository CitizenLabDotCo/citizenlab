import React, { useState } from 'react';

import Avatar from 'design-system/Avatar';
import CommentRow from 'design-system/CommentRow';

import { ICommentData } from 'api/comments/types';
import { IIdeaData } from 'api/ideas/types';
import { IUser } from 'api/users/types';

import useLocale from 'hooks/useLocale';

import UserName from 'components/UI/UserName';
import userNameMessages from 'components/UI/UserName/messages';

import { useIntl } from 'utils/cl-intl';
import { timeAgo } from 'utils/dateUtils';

import CommentBody from './CommentBody';
import CommentReplyButton from './CommentReplyButton';
import CommentsMoreActions from './CommentsMoreActions';

interface Props {
  comment: ICommentData;
  commentType: 'parent' | 'child';
  author: IUser | undefined;
  ideaId: string | undefined;
  projectId?: string | null;
  authorCanModerate: boolean;
  idea?: IIdeaData;
}

// The comment as a row of the back office's idea panel: initial, name, time,
// the text, then its actions as quiet links.
const PanelComment = ({
  comment,
  commentType,
  author,
  ideaId,
  projectId,
  authorCanModerate,
  idea,
}: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const [editing, setEditing] = useState(false);
  const { attributes } = comment;

  if (attributes.publication_status !== 'published') return null;

  const authorId = author?.data.id ?? null;
  const initial = attributes.anonymous
    ? undefined
    : author?.data.attributes.first_name?.charAt(0).toUpperCase();

  return (
    <CommentRow
      avatar={
        initial ? (
          <Avatar size={24} initials={initial} tone="muted" />
        ) : (
          <Avatar
            size={24}
            content="image"
            alt={formatMessage(userNameMessages.anonymous)}
          />
        )
      }
      name={
        <UserName
          userId={authorId}
          isLinkToProfile={!!authorId}
          showModeratorStyles={authorCanModerate}
          color="var(--gv-text-primary)"
          fontSize={13}
          anonymous={attributes.anonymous}
        />
      }
      time={timeAgo(Date.parse(attributes.created_at), locale) ?? ''}
      isReply={commentType === 'child'}
      actions={
        !editing && (
          <>
            <CommentReplyButton
              commentId={comment.id}
              commentType={commentType}
              authorId={authorId}
              idea={idea}
              comment={comment}
            />
            <CommentsMoreActions
              projectId={projectId}
              comment={comment}
              onCommentEdit={() => setEditing(true)}
              ideaId={ideaId}
            />
          </>
        )
      }
    >
      <CommentBody
        commentId={comment.id}
        commentType={commentType}
        editing={editing}
        onCommentSaved={() => setEditing(false)}
        onCancelEditing={() => setEditing(false)}
        ideaId={ideaId}
      />
    </CommentRow>
  );
};

export default PanelComment;
