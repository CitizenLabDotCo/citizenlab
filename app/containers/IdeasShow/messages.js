/*
 * IdeasShow Messages
 *
 * This contains all the text for the IdeasShow component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  loadVotesError: {
    id: 'app.containers.IdeasShow.loadVotesError',
    defaultMessage: 'Voting is not currently available',
  },
  postedIn: {
    id: 'app.containers.IdeasShow.postedIn',
    defaultMessage: 'Posted in {projectLink}',
  },
  closeMap: {
    id: 'app.containers.IdeasShow.closeMap',
    defaultMessage: 'Close Map',
  },
  openMap: {
    id: 'app.containers.IdeasShow.openMap',
    defaultMessage: 'Show idea on map',
  },
  Map: {
    id: 'app.containers.IdeasShow.Map',
    defaultMessage: 'Map',
  },
  ideaVoteSubmitError: {
    id: 'app.containers.IdeasShow.ideaVoteSubmitError',
    defaultMessage: 'Voting failed',
  },
  voteOnThisIdea: {
    id: 'app.containers.IdeasShow.voteOnThisIdea',
    defaultMessage: 'Vote on this idea',
  },
  commentEditorHeader: {
    id: 'app.containers.IdeasShow.commentEditorHeader',
    defaultMessage: 'Comment the idea!',
  },
  commentEditorLabel: {
    id: 'app.containers.IdeasShow.commentEditorLabel',
    defaultMessage: 'Comment the idea!',
  },
  commentReplyButton: {
    id: 'app.containers.IdeasShow.commentReplyButton',
    defaultMessage: 'Reply',
  },
  commentDeleteButton: {
    id: 'app.containers.IdeasShow.commentDeleteButton',
    defaultMessage: 'Delete',
  },
  loadingIdea: {
    id: 'app.containers.IdeasShow.loadingIdea',
    defaultMessage: 'Loading idea...',
  },
  oneSecond: {
    id: 'app.containers.IdeasShow.oneSecond',
    defaultMessage: 'Just one second...',
  },
  ideaNotFound: {
    id: 'app.containers.IdeasShow.ideaNotFound',
    defaultMessage: 'Ups... it seems that this idea has be removed or forgotten!',
  },
  emptyCommentError: {
    id: 'app.containers.IdeasShow.emptyCommentError',
    defaultMessage: 'The comment can\'t be empty',
  },
  addCommentError: {
    id: 'app.containers.IdeasShow.addCommentError',
    defaultMessage: 'Something went wrong. Please try again later.',
  },
  submittingComment: {
    id: 'app.containers.IdeasShow.submittingComment',
    defaultMessage: 'Publishing...',
  },
  publishComment: {
    id: 'app.containers.IdeasShow.publishComment',
    defaultMessage: 'Post comment',
  },
  loadMoreComments: {
    id: 'app.containers.IdeasShow.loadMoreComments',
    defaultMessage: 'Load more comments...',
  },
  loadingComments: {
    id: 'app.containers.IdeasShow.loadingComments',
    defaultMessage: 'Loading comments...',
  },
  placeholderComment: {
    id: 'app.containers.IdeasShow.placeholderComment',
    defaultMessage: 'Tell us your thoughts!',
  },
  deleteComment: {
    id: 'app.containers.IdeasShow.deleteComment',
    defaultMessage: 'Delete',
  },
  editComment: {
    id: 'app.containers.IdeasShow.editComment',
    defaultMessage: 'Edit',
  },
  confirmCommentDeletion: {
    id: 'app.containers.IdeasShow.confirmCommentDeletion',
    defaultMessage: `Are you sure you want to delete this comment? There's no turning back!`,
  },
  commentDeletionCancelButton: {
    id: 'app.containers.IdeasShow.commentDeletionCancelButton',
    defaultMessage: `Keep my comment`,
  },
  commentDeletionConfirmButton: {
    id: 'app.containers.IdeasShow.commentDeletionConfirmButton',
    defaultMessage: `Delete my comment`,
  },
  deleteReason_inappropriate: {
    id: 'app.containers.IdeasShow.deleteReason_inappropriate',
    defaultMessage: `Inappropriate comment`,
  },
  deleteReason_other: {
    id: 'app.containers.IdeasShow.deleteReason_other',
    defaultMessage: `Other reason (please specify)`,
  },
  adminCommentDeletionConfirmButton: {
    id: 'app.containers.IdeasShow.adminCommentDeletionConfirmButton',
    defaultMessage: `Delete this comment`,
  },
  helmetTitle: {
    id: 'app.containers.IdeasShow.helmetTitle',
    defaultMessage: 'Show idea',
  },
  byAuthorName: {
    id: 'app.containers.IdeasShow.byAuthorName',
    defaultMessage: 'by {authorName}',
  },
  deletedUser: {
    id: 'app.containers.IdeasShow.deletedUser',
    defaultMessage: 'deleted user',
  },
  commentDeletedPlaceholder: {
    id: 'app.containers.IdeasShow.commentDeletedPlaceholder',
    defaultMessage: 'This comment has been deleted.',
  },
  author: {
    id: 'app.containers.IdeasShow.author',
    defaultMessage: '{authorNameComponent}',
  },
  parentCommentAuthor: {
    id: 'app.containers.IdeasShow.parentCommentAuthor',
    defaultMessage: '{authorNameComponent} said',
  },
  childCommentAuthor: {
    id: 'app.containers.IdeasShow.childCommentAuthor',
    defaultMessage: '{authorNameComponent} replied',
  },
  shareCTA: {
    id: 'app.containers.IdeasShow.shareCTA',
    defaultMessage: 'Share this idea',
  },
  shareOnFacebook: {
    id: 'app.containers.IdeasShow.shareOnFacebook',
    defaultMessage: 'Share on Facebook',
  },
  shareOnTwitter: {
    id: 'app.containers.IdeasShow.shareOnTwitter',
    defaultMessage: 'Share on Twitter',
  },
  commentsWithCount: {
    id: 'app.containers.IdeasShow.commentsWithCount',
    defaultMessage: 'Comments ({count})',
  },
  ideaStatus: {
    id: 'app.containers.IdeasShow.ideaStatus',
    defaultMessage: 'Idea status',
  },
  commentsTitle: {
    id: 'app.containers.IdeasShow.commentsTitle',
    defaultMessage: 'Give your opinion',
  },
  commentBodyPlaceholder: {
    id: 'app.containers.IdeasShow.commentBodyPlaceholder',
    defaultMessage: 'What do you think about this idea?',
  },
  childCommentBodyPlaceholder: {
    id: 'app.containers.IdeasShow.childCommentBodyPlaceholder',
    defaultMessage: 'Write a reply...',
  },
  commentSuccess: {
    id: 'app.containers.IdeasShow.commentSuccess',
    defaultMessage: 'Thanks for contributing!',
  },
  signInToComment: {
    id: 'app.containers.IdeasShow.signInToComment',
    defaultMessage: 'Please {signInLink} to spread your wisdom.',
  },
  signInLinkText: {
    id: 'app.containers.IdeasShow.signInLinkText',
    defaultMessage: 'log in',
  },
  login: {
    id: 'app.components.IdeasShow.login',
    defaultMessage: 'Login',
  },
  register: {
    id: 'app.components.IdeasShow.register',
    defaultMessage: 'Create an account',
  },
  moreOptions: {
    id: 'app.components.IdeasShow.moreOptions',
    defaultMessage: 'More options',
  },
  reportAsSpam: {
    id: 'app.components.IdeasShow.reportAsSpam',
    defaultMessage: 'Report as spam',
  },
  editIdea: {
    id: 'app.components.IdeasShow.editIdea',
    defaultMessage: 'Edit idea',
  },
  lastUpdated: {
    id: 'app.components.IdeasShow.lastUpdated',
    defaultMessage: 'Last modified {modificationTime}',
  },
  lastChangesTitle: {
    id: 'app.components.IdeasShow.lastChangesTitle',
    defaultMessage: 'Last changes to this idea',
  },
  changeLogEntry: {
    id: 'app.components.IdeasShow.changeLogEntry',
    defaultMessage: `{changeType, select,
      changed_status {{userName} has updated the status of this idea}
      published {{userName} created this idea}
      changed_title {{userName} updated the title of this idea}
      changed_body {{userName} updated the description of this idea}
    }`,
  },
  commentingDisabledProjectInactive: {
    id: 'app.components.IdeasShow.commentingDisabledProjectInactive',
    defaultMessage: 'Commenting on this idea is not possible, since \'{projectName}\' is not yet or no longer active.',
  },
  commentingDisabledInContext: {
    id: 'app.components.IdeasShow.commentingDisabledInContext',
    defaultMessage: 'Commenting on ideas in \'{projectName}\' is currently disabled.',
  },
  goBack: {
    id: 'app.components.IdeasShow.goBack',
    defaultMessage: 'Go back',
  },
});
