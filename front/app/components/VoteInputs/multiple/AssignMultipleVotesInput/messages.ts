import { defineMessages } from 'react-intl';

export default defineMessages({
  xVotes: {
    id: 'app.components.AssignMultipleVotesControl.xVotes2',
    defaultMessage: '{votes, plural, one {{singular}} other {{plural}}}',
  },
  numberManualVotes: {
    id: 'app.components.AssignMultipleVotesControl.numberManualVotes2',
    defaultMessage:
      '{manualVotes, plural, one {(incl. 1 offline)} other {(incl. # offline)}}',
  },
  select: {
    id: 'app.components.AssignMultipleVotesControl.select',
    defaultMessage: 'Select',
  },
  vote: {
    id: 'app.components.AssignMultipleVotesControl.vote',
    defaultMessage: 'Vote',
  },
  votes: {
    id: 'app.components.AssignMultipleVotesControl.votes',
    defaultMessage: 'votes',
  },
  removeVote: {
    id: 'app.components.AssignMultipleVotesControl.removeVote',
    defaultMessage: 'Remove vote',
  },
  addVote: {
    id: 'app.components.AssignMultipleVotesControl.addVote',
    defaultMessage: 'Add vote',
  },

  // disabled explanations
  maxVotesPerIdeaReached: {
    id: 'app.components.AssignMultipleVotesControl.maxVotesPerIdeaReached',
    defaultMessage:
      'You have reached the maximum number of {maxVotes} votes per idea',
  },
  maxVotesReached: {
    id: 'app.components.AssignMultipleVotesControl.maxVotesReached',
    defaultMessage: 'You have used all of your votes',
  },
  votesSubmitted: {
    id: 'app.components.AssignMultipleVotesControl.votesSubmitted',
    defaultMessage:
      'You have already submitted your votes. Click "Modify your vote" to change your votes.',
  },
  votesSubmittedIdeaPage: {
    id: 'app.components.AssignMultipleVotesControl.votesSubmittedIdeaPage',
    defaultMessage:
      'You have already submitted your votes. To change your votes, go back to the project page and click "Modify your vote".',
  },
  phaseNotActive: {
    id: 'app.components.AssignMultipleVotesControl.phaseNotActive',
    defaultMessage: 'Voting is not available, since this phase is not active.',
  },
});
