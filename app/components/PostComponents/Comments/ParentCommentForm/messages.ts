import { defineMessages } from 'react-intl';

export default defineMessages({
  addCommentError: {
    id: 'app.components.PostComponents.Comments.ParentCommentForm.addCommentError',
    defaultMessage: 'Something went wrong. Please try again later.',
  },
  emptyCommentError: {
    id: 'app.components.PostComponents.Comments.ParentCommentForm.emptyCommentError',
    defaultMessage: 'The comment can\'t be empty',
  },
  commentBodyPlaceholder: {
    id: 'app.components.PostComponents.Comments.ParentCommentForm.commentBodyPlaceholder',
    defaultMessage: 'What do you think about this idea?',
  },
  yourComment: {
    id: 'app.components.PostComponents.Comments.ParentCommentForm.yourComment',
    defaultMessage: 'Your comment',
  },
  publishComment: {
    id: 'app.components.PostComponents.Comments.ParentCommentForm.publishComment',
    defaultMessage: 'Post comment',
  },
});
