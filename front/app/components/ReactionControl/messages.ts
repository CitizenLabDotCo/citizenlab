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
  reactionSuccessTitle: {
    id: 'app.containers.ReactionControl.reactionSuccessTitle',
    defaultMessage: 'Your reaction was successfully registered!',
  },
  reactionErrorTitle: {
    id: 'app.containers.VoteControl.voteErrorTitle',
    defaultMessage: 'Something went wrong',
  },
  reactionErrorSubTitle: {
    id: 'app.containers.ReactionControl.reactionErrorSubTitle',
    defaultMessage:
      'Due to an error your reaction could not being registered. Please try again in a few minutes.',
  },
  close: {
    id: 'app.containers.VoteControl.close',
    defaultMessage: 'Close',
  },
});
