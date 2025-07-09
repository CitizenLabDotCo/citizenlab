import { defineMessages } from 'react-intl';

export default defineMessages({
  xVotes: {
    id: 'app.components.AssignMultipleVotesControl.xVotes3',
    defaultMessage: '{votes, plural, one {vote} other {votes}}',
  },
  xPoints: {
    id: 'app.components.AssignMultipleVotesControl.xPoints',
    defaultMessage: '{points, plural, one {point} other {points}}',
  },
  xTokens: {
    id: 'app.components.AssignMultipleVotesControl.xTokens',
    defaultMessage: '{tokens, plural, one {token} other {tokens}}',
  },
  xCredits: {
    id: 'app.components.AssignMultipleVotesControl.xCredits',
    defaultMessage: '{credits, plural, one {credit} other {credits}}',
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
  votesSubmitted1: {
    id: 'app.components.AssignMultipleVotesControl.votesSubmitted1',
    defaultMessage:
      'You have already submitted your vote. To modify it, click "Modify your submission".',
  },
  votesSubmittedIdeaPage1: {
    id: 'app.components.AssignMultipleVotesControl.votesSubmittedIdeaPage1',
    defaultMessage:
      'You have already submitted your vote. To modify it, go back to the project page and click "Modify your submission".',
  },
  phaseNotActive: {
    id: 'app.components.AssignMultipleVotesControl.phaseNotActive',
    defaultMessage: 'Voting is not available, since this phase is not active.',
  },
});
