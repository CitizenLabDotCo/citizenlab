import { defineMessages } from 'react-intl';

export default defineMessages({
  noComments: {
    id: 'app.components.PostComponents.Comments.noComments',
    defaultMessage: 'There are no comments yet.',
  },
  loadingMoreComments: {
    id: 'app.components.PostComponents.Comments.loadingMoreComments',
    defaultMessage: 'Loading more comments...',
  },
  commentingDisabledProjectInactive: {
    id: 'app.components.PostComponents.Comments.commentingDisabledProjectInactive',
    defaultMessage: "Commenting on this idea is not possible because '{projectName}' is currently not active.",
  },
  commentingDisabledInContext: {
    id: 'app.components.PostComponents.Comments.commentingDisabledInContext',
    defaultMessage: "Commenting on ideas in '{projectName}' is currently disabled.",
  },
  commentingDisabledIdeaNotInCurrentPhase: {
    id: 'app.components.PostComponents.Comments.commentingDisabledIdeaNotInCurrentPhase',
    defaultMessage: "Commenting on this idea is not possible since it's no longer or not yet in consideration.",
  },
  commentingNotPermitted: {
    id: 'app.components.PostComponents.Comments.commentingNotPermitted',
    defaultMessage: 'Commenting on this idea is currently not allowed',
  },
  commentingMaybeNotPermitted: {
    id: 'app.components.PostComponents.Comments.commentingMaybeNotPermitted',
    defaultMessage: 'Not all users are allowed to comment. Please {signInLink} to see whether you comply.',
  },
  signInToComment: {
    id: 'app.containers.PostComponents.Comments.signInToComment',
    defaultMessage: 'Please {signInLink} to spread your wisdom.',
  },
  signInLinkText: {
    id: 'app.containers.PostComponents.Comments.signInLinkText',
    defaultMessage: 'log in',
  },
});
