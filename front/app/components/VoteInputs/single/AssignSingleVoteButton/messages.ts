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
  votesSubmitted1: {
    id: 'app.components.AssignVoteControl.votesSubmitted1',
    defaultMessage:
      'You have already submitted your vote. To modify it, click "Modify your submission".',
  },
  votesSubmittedIdeaPage1: {
    id: 'app.components.AssignVoteControl.votesSubmittedIdeaPage1',
    defaultMessage:
      'You have already submitted your vote. To modify it, go back to the project page and click "Modify your submission".',
  },
  maxVotesReached: {
    id: 'app.components.AssignVoteControl.maxVotesReached1',
    defaultMessage: 'You have distributed all of your votes.',
  },
  phaseNotActive: {
    id: 'app.components.AssignVoteControl.phaseNotActive',
    defaultMessage: 'Voting is not available, since this phase is not active.',
  },
});
