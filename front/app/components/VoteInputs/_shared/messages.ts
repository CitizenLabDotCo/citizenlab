import { defineMessages } from 'react-intl';

export default defineMessages({
  votesLeft: {
    id: 'app.components.VoteInputs._shared.votesLeft',
    defaultMessage:
      'You have {votesLeft} / {totalNumberOfVotes} {totalNumberOfVotes, plural, =0 {{votesTerm}} one {{voteTerm}} other {{votesTerm}}} left.',
  },
  vote: {
    id: 'app.components.ParticipationCTABars.votesCounter.vote',
    defaultMessage: 'vote',
  },
  votes: {
    id: 'app.components.ParticipationCTABars.votesCounter.votes',
    defaultMessage: 'votes',
  },
});
