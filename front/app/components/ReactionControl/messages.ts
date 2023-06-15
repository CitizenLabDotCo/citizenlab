import { defineMessages } from 'react-intl';

export default defineMessages({
  reactingDisabledProjectInactive: {
    id: 'app.components.ReactionControl.reactingDisabledProjectInactive',
    defaultMessage: 'You can no longer react to ideas in {projectName}',
  },
  reactingDisabledPhaseOver: {
    id: 'app.components.ReactionControl.reactingDisabledPhaseOver',
    defaultMessage: "It's no longer possible to react in this phase",
  },
  reactingDisabledFutureEnabled: {
    id: 'app.components.ReactionControl.reactingDisabledFutureEnabled',
    defaultMessage: 'Reacting will be enabled once this phase starts',
  },
  reactingPossibleLater: {
    id: 'app.components.ReactionControl.reactingPossibleLater',
    defaultMessage: 'Reacting will start on {enabledFromDate}',
  },
  reactingNotEnabled: {
    id: 'app.components.ReactionControl.reactingNotEnabled',
    defaultMessage: 'Reacting is currently not enabled for this project',
  },
  reactingNotSignedIn: {
    id: 'app.components.ReactionControl.reactingNotSignedIn',
    defaultMessage: 'Sign in to react.',
  },
  likingDisabledMaxReached: {
    id: 'app.components.ReactionControl.likingDisabledMaxReached',
    defaultMessage:
      "You've reached your maximum number of likes in {projectName}",
  },
  dislikingDisabledMaxReached: {
    id: 'app.components.ReactionControl.dislikingDisabledMaxReached',
    defaultMessage:
      "You've reached your maximum number of dislikes in {projectName}",
  },
  reactingNotPermitted: {
    id: 'app.components.ReactionControl.reactingNotPermitted',
    defaultMessage: 'Reacting is only enabled for certain groups',
  },
  completeProfileToReact: {
    id: 'app.components.ReactionControl.completeProfileToReact',
    defaultMessage: 'Complete your profile to react',
  },
  reactingVerifyToReact: {
    id: 'app.components.ReactionControl.reactingVerifyToReact',
    defaultMessage: 'Verify your identity in order to react.',
  },
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
