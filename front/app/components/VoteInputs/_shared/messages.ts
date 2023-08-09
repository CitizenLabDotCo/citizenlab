import { defineMessages } from 'react-intl';

export default defineMessages({
  votesLeft: {
    id: 'app.components.VoteInputs._shared.votesLeft2',
    defaultMessage:
      'You have {votesLeft} / {totalNumberOfVotes} {votesLeft, plural, =0 {{votesTerm}} one {{voteTerm}} other {{votesTerm}}} left',
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
