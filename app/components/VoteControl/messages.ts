
import { defineMessages } from 'react-intl';
export default defineMessages({
  votingDisabledProjectInactive: {
    id: 'app.components.VoteControl.votingDisabledProjectInactive',
    defaultMessage: 'You can no longer or not yet vote on ideas in {projectName}',
  },
  votingDisabledPhaseCompleted: {
    id: 'app.components.VoteControl.votingDisabledNotInCurrentPhase',
    defaultMessage: 'Voting on this idea is no longer possible because the phase it belongs to has ended',
  },
  votingDisabledPhaseNotYetStarted: {
    id: 'app.components.VoteControl.votingDisabledPhaseNotYetStarted',
    defaultMessage: 'Voting on this idea is not yet possible because the phase it belongs to has not yet started',
  },
  votingDisabledPossibleLater: {
    id: 'app.components.VoteControl.votingDisabledPossibleLater',
    defaultMessage: 'Voting on ideas in {projectName} will be possible from {enabledFromDate}',
  },
  votingDisabledForProject: {
    id: 'app.components.VoteControl.votingDisabledForProject',
    defaultMessage: 'Voting on ideas in {projectName} is not possible',
  },
  votingDisabledMaxReached: {
    id: 'app.components.VoteControl.votingDisabledMaxReached',
    defaultMessage: 'You\'ve reached your maximum number of votes in {projectName}',
  },
  votingDisabledNotPermitted: {
    id: 'app.components.VoteControl.votingDisabledNotPermitted',
    defaultMessage: 'Unfortunately, you don\'t have the rights to vote on this idea',
  },
});
