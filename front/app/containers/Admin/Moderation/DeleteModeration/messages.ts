import { defineMessages } from 'react-intl';

export default defineMessages({
  deleteComment: {
    id: 'app.containers.Admin.Moderation.deleteComment',
    defaultMessage: 'Delete comment',
  },
  commentDeletionCancelButton: {
    id: 'app.containers.Admin.Moderation.commentDeletionCancelButton',
    defaultMessage: 'Cancel',
  },
  confirmCommentDeletion: {
    id: 'app.containers.Admin.Moderation.confirmCommentDeletion',
    defaultMessage:
      "Are you sure you want to delete this comment? This is permanent and can't be undone.",
  },
  commentDeletionConfirmButton: {
    id: 'app.containers.Admin.Moderation.commentDeletionConfirmButton',
    defaultMessage: 'Delete',
  },
});
