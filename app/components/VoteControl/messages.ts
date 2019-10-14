import { defineMessages } from 'react-intl';

export default defineMessages({
  votingDisabledProjectInactive: {
    id: 'app.components.VoteControl.votingDisabledProjectInactive',
    defaultMessage: 'You can no longer or not yet vote on ideas in {projectName}',
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
  upvote: {
    id: 'app.components.VoteControl.upvote',
    defaultMessage: 'Upvote',
  },
  downvote: {
    id: 'app.components.VoteControl.downvote',
    defaultMessage: 'Downvote',
  },
});
