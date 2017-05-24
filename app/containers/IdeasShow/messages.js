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
  ideaVoteSubmitError: {
    id: 'app.containers.IdeasShow.ideaVoteSubmitError',
    defaultMessage: 'Voting failed',
  },
  commentEditorHeader: {
    id: 'app.containers.IdeasShow.commentEditorHeader',
    defaultMessage: 'Comment the idea!',
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
  submittingComment: {
    id: 'app.containers.IdeasShow.submittingComment',
    defaultMessage: 'Publishing...',
  },
  publishComment: {
    id: 'app.containers.IdeasShow.publishComment',
    defaultMessage: 'Publish',
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
});
