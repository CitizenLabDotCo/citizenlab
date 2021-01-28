import { defineMessages } from 'react-intl';

export default defineMessages({
  votingDisabledProjectInactive: {
    id: 'app.components.VoteControl.votingDisabledProjectInactive',
    defaultMessage: 'You can no longer vote on ideas in {projectName}',
  },
  votingDisabledPhaseOver: {
    id: 'app.components.VoteControl.votingDisabledPhaseOver',
    defaultMessage: "It's no longer possible to vote in this phase",
  },
  votingDisabledFutureEnabled: {
    id: 'app.components.VoteControl.votingDisabledFutureEnabled',
    defaultMessage: 'Voting will be enabled once this phase starts',
  },
  votingPossibleLater: {
    id: 'app.components.VoteControl.votingPossibleLater',
    defaultMessage: 'Voting will start on {enabledFromDate}',
  },
  votingNotEnabled: {
    id: 'app.components.VoteControl.votingNotEnabled',
    defaultMessage: 'Voting is currently not enabled for this project',
  },
  votingDisabledMaxReached: {
    id: 'app.components.VoteControl.votingDisabledMaxReached',
    defaultMessage:
      "You've reached your maximum number of votes in {projectName}",
  },
  votingNotPermitted: {
    id: 'app.components.VoteControl.votingNotPermitted',
    defaultMessage: 'Voting is only enabled for certain groups',
  },
  votingNotVerified: {
    id: 'app.components.VoteControl.votingNotVerified',
    defaultMessage: '{linkToVerification} in order to vote.',
  },
  linkToVerificationText: {
    id: 'app.components.VoteControl.linkToVerificationText',
    defaultMessage: 'Verify your identity',
  },
  upvote: {
    id: 'app.components.VoteControl.upvote',
    defaultMessage: 'Upvote',
  },
  downvote: {
    id: 'app.components.VoteControl.downvote',
    defaultMessage: 'Downvote',
  },
  a11y_upvotesDownvotes: {
    id: 'app.containers.VoteControl.a11y_upvotesDownvotes',
    defaultMessage:
      'Total upvotes: {upvotesCount}, total downvotes: {downvotesCount}',
  },
  voteSuccessTitle: {
    id: 'app.containers.VoteControl.voteSuccessTitle',
    defaultMessage: 'Your vote was successfully registered!',
  },
  voteErrorTitle: {
    id: 'app.containers.VoteControl.voteErrorTitle',
    defaultMessage: 'Something went wrong',
  },
  voteErrorSubTitle: {
    id: 'app.containers.VoteControl.voteErrorSubTitle',
    defaultMessage:
      'Due to an error your vote could not being registered. Please try again in a few minutes.',
  },
  close: {
    id: 'app.containers.VoteControl.close',
    defaultMessage: 'Close',
  },
});
