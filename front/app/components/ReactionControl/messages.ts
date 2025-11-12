import { defineMessages } from 'react-intl';

export default defineMessages({
  like: {
    id: 'app.components.ReactionControl.like',
    defaultMessage: 'Like',
  },
  dislike: {
    id: 'app.components.ReactionControl.dislike',
    defaultMessage: 'Dislike',
  },
  a11y_likesDislikes: {
    id: 'app.containers.ReactionControl.a11y_likesDislikes',
    defaultMessage:
      'Total likes: {likesCount}, total dislikes: {dislikesCount}',
  },

  close: {
    id: 'app.containers.VoteControl.close',
    defaultMessage: 'Close',
  },
  likeSuccess: {
    id: 'app.containers.ReactionControl.likeSuccess',
    defaultMessage: 'You liked this input successfully.',
  },
  dislikeSuccess: {
    id: 'app.containers.ReactionControl.dislikeSuccess',
    defaultMessage: 'You disliked this input successfully.',
  },
  cancelLikeSuccess: {
    id: 'app.containers.ReactionControl.cancelLikeSuccess',
    defaultMessage: 'You cancelled your like for this input successfully.',
  },
  cancelDislikeSuccess: {
    id: 'app.containers.ReactionControl.cancelDislikeSuccess',
    defaultMessage: 'You cancelled your dislike for this input successfully.',
  },
  vote: {
    id: 'app.containers.ReactionControl.vote',
    defaultMessage: 'Vote',
  },
  voted: {
    id: 'app.containers.ReactionControl.voted',
    defaultMessage: 'Voted',
  },
});
