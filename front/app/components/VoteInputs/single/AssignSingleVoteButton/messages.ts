import { defineMessages } from 'react-intl';

export default defineMessages({
  select: {
    id: 'app.components.AssignVoteControl.select',
    defaultMessage: 'Select',
  },
  selected: {
    id: 'app.components.AssignVoteControl.selected2',
    defaultMessage: 'Selected',
  },
  votesSubmitted: {
    id: 'app.components.AssignVoteControl.votesSubmitted',
    defaultMessage:
      'You have already submitted your {votes, plural, one {vote} other {votes}}. Click "Modify your vote" to change your {votes, plural, one {vote} other {votes}}.',
  },
  votesSubmittedIdeaPage: {
    id: 'app.components.AssignVoteControl.votesSubmittedIdeaPage',
    defaultMessage:
      'You have already submitted your {votes, plural, one {vote} other {votes}}. To change your {votes, plural, one {vote} other {votes}}, go back to the project page and click "Modify your vote".',
  },
  maxVotesReached: {
    id: 'app.components.AssignVoteControl.maxVotesReached',
    defaultMessage:
      'You have reached the maximum number of votes you can submit.',
  },
  phaseNotActive: {
    id: 'app.components.AssignVoteControl.phaseNotActive',
    defaultMessage: 'Voting is not available, since this phase is not active.',
  },
});
