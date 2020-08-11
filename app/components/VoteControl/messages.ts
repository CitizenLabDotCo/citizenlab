import { defineMessages } from 'react-intl';

export default defineMessages({
  votingDisabledProjectInactive: {
    id: 'app.components.VoteControl.votingDisabledProjectInactive',
    defaultMessage: 'You can no longer vote on ideas in {projectName}',
  },
  votingDisabledPhaseCompleted: {
    id: 'app.components.VoteControl.votingDisabledPhaseCompleted',
    defaultMessage:
      'Voting on this idea is no longer possible because the phase it belongs to has ended',
  },
  votingDisabledPhaseNotYetStarted: {
    id: 'app.components.VoteControl.votingDisabledPhaseNotYetStarted',
    defaultMessage:
      'Voting on this idea will be possible starting from {enabledFromDate}',
  },
  votingDisabledPossibleLater: {
    id: 'app.components.VoteControl.votingDisabledPossibleLater',
    defaultMessage:
      'Voting on ideas in {projectName} will be possible starting from {enabledFromDate}',
  },
  votingDisabled: {
    id: 'app.components.VoteControl.votingDisabled',
    defaultMessage: 'Voting on ideas in {projectName} is currently not enabled',
  },
  votingDisabledMaxReached: {
    id: 'app.components.VoteControl.votingDisabledMaxReached',
    defaultMessage:
      "You've reached your maximum number of votes in {projectName}",
  },
  votingDisabledNotPermitted: {
    id: 'app.components.VoteControl.votingDisabledNotPermitted',
    defaultMessage: 'Voting on this idea is currently not allowed',
  },
  votingDisabledNotVerified: {
    id: 'app.components.VoteControl.votingDisabledNotVerified',
    defaultMessage:
      'Voting on this idea requires verification of your account. {verificationLink}',
  },
  verificationLinkText: {
    id: 'app.components.VoteControl.verificationLinkText',
    defaultMessage: 'Verify your account now.',
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
