import { defineMessages } from 'react-intl';

export default defineMessages({
  votesLeft: {
    id: 'app.components.VoteInputs._shared.votesLeft6',
    defaultMessage:
      'You have {votesLeft} / {totalNumberOfVotes} {votesLeft, plural, =0 {votes} one {vote} other {votes}} left.',
  },
  pointsLeft: {
    id: 'app.components.VoteInputs._shared.pointsLeft2',
    defaultMessage:
      'You have {votesLeft} / {totalNumberOfVotes} {votesLeft, plural, =0 {points} one {point} other {points}} left.',
  },
  tokensLeft: {
    id: 'app.components.VoteInputs._shared.tokensLeft2',
    defaultMessage:
      'You have {votesLeft} / {totalNumberOfVotes} {votesLeft, plural, =0 {tokens} one {token} other {tokens}} left.',
  },
  creditsLeft: {
    id: 'app.components.VoteInputs._shared.creditsLeft2',
    defaultMessage:
      'You have {votesLeft} / {totalNumberOfVotes} {votesLeft, plural, =0 {credits} one {credit} other {credits}} left.',
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
