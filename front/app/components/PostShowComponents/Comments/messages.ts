import { defineMessages } from 'react-intl';

export default defineMessages({
  invisibleTitleComments: {
    id: 'app.components.Comments.invisibleTitleComments',
    defaultMessage: 'Comments',
  },
  cancel: {
    id: 'app.components.Comments.cancel',
    defaultMessage: 'Cancel',
  },
  official: {
    id: 'app.components.Comments.official',
    defaultMessage: 'Official',
  },
  addCommentError: {
    id: 'app.containers.Comments.addCommentError',
    defaultMessage: 'Something went wrong. Please try again later.',
  },
  replyToComment: {
    id: 'app.components.Comments.replyToComment',
    defaultMessage: 'Reply to comment',
  },
  childCommentBodyPlaceholder: {
    id: 'app.containers.Comments.childCommentBodyPlaceholder',
    defaultMessage: 'Write a reply...',
  },
  publishComment: {
    id: 'app.containers.Comments.publishComment',
    defaultMessage: 'Post comment',
  },
  commentDeletedPlaceholder: {
    id: 'app.containers.Comments.commentDeletedPlaceholder',
    defaultMessage: 'This comment has been deleted.',
  },
  saveCommentEdit: {
    id: 'app.containers.Comments.saveComment',
    defaultMessage: 'Save',
  },
  cancelCommentEdit: {
    id: 'app.containers.Comments.cancelCommentEdit',
    defaultMessage: 'Cancel',
  },
  commentingDisabledInactiveProject: {
    id: 'app.components.Comments.commentingDisabledInactiveProject',
    defaultMessage:
      'Commenting is not possible because this project is currently not active.',
  },
  commentingDisabledProject: {
    id: 'app.components.Comments.commentingDisabledProject',
    defaultMessage: 'Commenting in this project is currently disabled.',
  },
  commentingDisabledInCurrentPhase: {
    id: 'app.components.Comments.commentingDisabledInCurrentPhase',
    defaultMessage: 'Commenting is not possible in the current phase.',
  },
  commentingDisabledUnverified: {
    id: 'app.components.Comments.commentingDisabledUnverified',
    defaultMessage: '{verifyIdentityLink} to comment.',
  },
  commentingMaybeNotPermitted: {
    id: 'app.components.Comments.commentingMaybeNotPermitted',
    defaultMessage:
      'Not all users are allowed to comment. Please {signUpLink} or {signInLink} to see whether you comply.',
  },
  signInToComment: {
    id: 'app.containers.Comments.signInToComment',
    defaultMessage: 'Please {signUpLink} or {signInLink} to comment.',
  },
  commentingInitiativeNotPermitted: {
    id: 'app.components.Comments.commentingInitiativeNotPermitted',
    defaultMessage: "You don't have the rights to comment.",
  },
  commentingInitiativeMaybeNotPermitted: {
    id: 'app.components.Comments.commentingInitiativeMaybeNotPermitted',
    defaultMessage:
      'Not all users are allowed to comment. Please {signUpLink} or {signInLink} to see whether you comply.',
  },
  signInToCommentInitiative: {
    id: 'app.containers.Comments.signInToCommentInitiative',
    defaultMessage: 'Please {signUpLink} or {signInLink} to comment.',
  },
  signInAndVerifyToCommentInitiative: {
    id: 'app.containers.Comments.signInAndVerifyToCommentInitiative',
    defaultMessage:
      'You need a verified account to comment, please {signUpLink} or {signInLink}.',
  },
  signInLinkText: {
    id: 'app.containers.Comments.signInLinkText',
    defaultMessage: 'log in',
  },
  signUpLinkText: {
    id: 'app.containers.Comments.signUpLinkText',
    defaultMessage: 'sign up',
  },
  verifyIdentityLinkText: {
    id: 'app.containers.Comments.verifyIdentityLinkText',
    defaultMessage: 'Verify your identity',
  },
  adminCommentDeletionCancelButton: {
    id: 'app.containers.Comments.adminCommentDeletionCancelButton',
    defaultMessage: 'Leave the comment',
  },
  adminCommentDeletionConfirmButton: {
    id: 'app.containers.Comments.adminCommentDeletionConfirmButton',
    defaultMessage: 'Delete this comment',
  },
  reportAsSpam: {
    id: 'app.components.Comments.reportAsSpam',
    defaultMessage: 'Report as spam',
  },
  deleteComment: {
    id: 'app.containers.Comments.deleteComment',
    defaultMessage: 'Delete',
  },
  editComment: {
    id: 'app.containers.Comments.editComment',
    defaultMessage: 'Edit',
  },
  confirmCommentDeletion: {
    id: 'app.containers.Comments.confirmCommentDeletion',
    defaultMessage:
      "Are you sure you want to delete this comment? There's no turning back!",
  },
  commentDeletionCancelButton: {
    id: 'app.containers.Comments.commentDeletionCancelButton',
    defaultMessage: 'Keep my comment',
  },
  commentDeletionConfirmButton: {
    id: 'app.containers.Comments.commentDeletionConfirmButton',
    defaultMessage: 'Delete my comment',
  },
  reportAsSpamModalTitle: {
    id: 'app.containers.Comments.reportAsSpamModalTitle',
    defaultMessage: 'Why do you want to report this as spam?',
  },
  commentsSortTitle: {
    id: 'app.containers.Comments.commentsSortTitle',
    defaultMessage: 'Sort comments by',
  },
  oldestToNewest: {
    id: 'app.components.Comments.oldestToNewest',
    defaultMessage: 'Oldest to Newest',
  },
  mostUpvoted: {
    id: 'app.components.Comments.mostUpvoted',
    defaultMessage: 'Most voted',
  },
  upvoteComment: {
    id: 'app.components.Comments.upvoteComment',
    defaultMessage: 'Upvote this comment',
  },
  commentUpvote: {
    id: 'app.containers.Comments.commentUpvote',
    defaultMessage: 'Upvote',
  },
  commentCancelUpvote: {
    id: 'app.containers.Comments.commentCancelUpvote',
    defaultMessage: 'Cancel',
  },
  commentReplyButton: {
    id: 'app.containers.Comments.commentReplyButton',
    defaultMessage: 'Reply',
  },
  seeTranslation: {
    id: 'app.components.Comments.seeTranslation',
    defaultMessage: 'See translation',
  },
  seeOriginal: {
    id: 'app.components.Comments.seeOriginal',
    defaultMessage: 'See original',
  },
  loadingMoreComments: {
    id: 'app.containers.Comments.loadingMoreComments',
    defaultMessage: 'Loading more comments...',
  },
  emptyCommentError: {
    id: 'app.containers.Comments.emptyCommentError',
    defaultMessage: "The comment can't be empty",
  },
  loadMoreComments: {
    id: 'app.containers.Comments.loadMoreComments',
    defaultMessage: 'Load more comments',
  },
  loadingComments: {
    id: 'app.containers.Comments.loadingComments',
    defaultMessage: 'Loading comments...',
  },
  ideaCommentBodyPlaceholder: {
    id: 'app.containers.Comments.ideaCommentBodyPlaceholder',
    defaultMessage: 'What do you think about this idea?',
  },
  initiativeCommentBodyPlaceholder: {
    id: 'app.containers.Comments.initiativeCommentBodyPlaceholder',
    defaultMessage: 'What do you think about this initiative?',
  },
  yourComment: {
    id: 'app.components.Comments.yourComment',
    defaultMessage: 'Your comment',
  },
  showMoreActions: {
    id: 'app.containers.Comments.showMoreActions',
    defaultMessage: 'Show more actions',
  },
  deleteReason_other: {
    id: 'app.containers.Comments.deleteReason_other',
    defaultMessage: 'Other reason',
  },
  deleteReason_inappropriate: {
    id: 'app.containers.Comments.deleteReason_inappropriate',
    defaultMessage: 'It is inappropriate or offensive',
  },
  deleteReason_irrelevant: {
    id: 'app.containers.Comments.deleteReason_irrelevant',
    defaultMessage: 'This does not belong here',
  },
  a11y_commentPosted: {
    id: 'app.containers.Comments.a11y_commentPosted',
    defaultMessage: 'Comment posted',
  },
  a11y_commentDeleted: {
    id: 'app.containers.Comments.a11y_commentDeleted',
    defaultMessage: 'Comment deleted',
  },
  a11y_upvoteCount: {
    id: 'app.containers.Comments.a11y_upvoteCount',
    defaultMessage:
      '{upvoteCount, plural, =0 {no upvotes} one {1 upvote} other {# upvotes}}',
  },
  a11y_undoUpvote: {
    id: 'app.containers.Comments.a11y_undoUpvote',
    defaultMessage: 'Undo upvote',
  },
});
