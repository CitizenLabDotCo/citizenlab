import { defineMessages } from 'react-intl';

export default defineMessages({
  left: {
    id: 'app.components.ParticipationCTABars.left',
    defaultMessage: 'left',
  },
  votes: {
    id: 'app.components.ParticipationCTABars.votesCounter.votes',
    defaultMessage: 'votes',
  },
  votedFor: {
    id: 'app.components.ParticipationCTABars.votesCounter.votedFor',
    defaultMessage: 'Voted for',
  },
  xOptions: {
    id: 'app.components.ParticipationCTABars.votesCounter.xOptions',
    defaultMessage: '{votes, plural, one {option} other {options}}',
  },
  voteForAtLeastOne: {
    id: 'app.components.ParticipationCTABars.votesCounter.voteForAtLeastOne',
    defaultMessage: 'Vote for at least 1 option',
  },
});
