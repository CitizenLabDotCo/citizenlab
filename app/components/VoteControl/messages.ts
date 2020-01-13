import { defineMessages } from 'react-intl';

export default defineMessages({
  votingDisabledProjectInactive: {
    id: 'app.components.VoteControl.votingDisabledProjectInactive',
    defaultMessage: 'You can no longer vote on ideas in {projectName}',
  },
  votingDisabledPhaseCompleted: {
    id: 'app.components.VoteControl.votingDisabledPhaseCompleted',
    defaultMessage: 'Voting on this idea is no longer possible because the phase it belongs to has ended',
  },
  votingDisabledPhaseNotYetStarted: {
    id: 'app.components.VoteControl.votingDisabledPhaseNotYetStarted',
    defaultMessage: 'Voting on this idea will be possible starting from {enabledFromDate}',
  },
  votingDisabledPossibleLater: {
    id: 'app.components.VoteControl.votingDisabledPossibleLater',
    defaultMessage: 'Voting on ideas in {projectName} will be possible starting from {enabledFromDate}',
  },
  votingDisabledForProject: {
    id: 'app.components.VoteControl.votingDisabledForProject',
    defaultMessage: 'Voting on ideas in {projectName} is currently not enabled',
  },
  votingDisabledMaxReached: {
    id: 'app.components.VoteControl.votingDisabledMaxReached',
    defaultMessage: "You've reached your maximum number of votes in {projectName}",
  },
  votingDisabledNotPermitted: {
    id: 'app.components.VoteControl.votingDisabledNotPermitted',
    defaultMessage: 'Voting on this idea is currently not allowed',
  },
  votingDisabledNotVerified: {
    id: 'app.components.VoteControl.votingDisabledNotVerified',
    defaultMessage: 'Voting on this idea requires verification of your account. {verificationLink}',
  },
  verificationLinkText: {
    id: 'app.components.VoteControl.verificationLinkText',
    defaultMessage: 'Verify your account now.'
  },
  upvote: {
    id: 'app.components.VoteControl.upvote',
    defaultMessage: 'Upvote',
  },
  downvote: {
    id: 'app.components.VoteControl.downvote',
    defaultMessage: 'Downvote',
  },
  a11y_xDownvotes: {
    id: 'app.containers.VoteControl.a11y_xDownvotes',
    defaultMessage: 'Downvote. {count, plural, =0 {no downvotes} one {1 downvote} other {# downvotes}}',
  },
  a11y_xUpvotes: {
    id: 'app.containers.VoteControl.a11y_xUpvotes',
    defaultMessage: 'Upvote. {count, plural, =0 {no upvotes} one {1 upvote} other {# upvotes}}',
  },
  a11y_upvoteButtonClicked: {
    id: 'app.containers.VoteControl.a11y_upvoteButtonClicked',
    defaultMessage: 'Upvote button clicked.',
  },
  a11y_downvoteButtonClicked: {
    id: 'app.containers.VoteControl.a11y_downvoteButtonClicked',
    defaultMessage: 'Downvote button clicked.',
  },
  a11y_totalVotes: {
    id: 'app.containers.VoteControl.a11y_totalVotes',
    defaultMessage: 'Total upvotes: {upvotesCount}. Total downvotes: {downvotesCount}.',
  },
});
