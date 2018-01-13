/*
 * IdeaCard Messages
 *
 * This contains all the text for the IdeaCard component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  votingDisabledProjectInactive: {
    id: 'app.components.VoteControl.votingDisabledProjectInactive',
    defaultMessage: 'You can no longer vote on ideas in {projectName}',
  },
  votingDisabledNotInActiveContext: {
    id: 'app.components.VoteControl.votingDisabledNotInActiveContext',
    defaultMessage: 'This idea is no longer, or not yet in the running in {projectName}',
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
});
