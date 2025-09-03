import React from 'react';

import useComment from 'api/comments/useComment';
import { IModerationData } from 'api/moderations/types';

import DeleteCommentButton from './CommentDeleteButton';

type Props = {
  moderation: IModerationData;
};
const DeleteModerationComment = ({ moderation }: Props) => {
  const projectId = moderation.attributes.belongs_to.project?.id;
  const ideaId = moderation.attributes.belongs_to.idea?.id;

  const { data: comment } = useComment(moderation.id);

  return (
    <>
      {projectId && ideaId && comment && (
        <DeleteCommentButton comment={comment.data} />
      )}
    </>
  );
};

export default DeleteModerationComment;
