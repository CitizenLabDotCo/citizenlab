import { defineMessages } from 'react-intl';

export default defineMessages({
  votesLeft: {
    id: 'app.components.VoteInputs._shared.votesLeft5',
    defaultMessage:
      'You have {votesLeft} / {totalNumberOfVotes} {totalNumberOfVotes, plural, =0 {votes} one {vote} other {votes}} left.',
  },
  pointsLeft: {
    id: 'app.components.VoteInputs._shared.pointsLeft',
    defaultMessage:
      'You have {votesLeft} / {totalNumberOfVotes} {totalNumberOfVotes, plural, =0 {points} one {point} other {points}} left.',
  },
  tokensLeft: {
    id: 'app.components.VoteInputs._shared.tokensLeft',
    defaultMessage:
      'You have {votesLeft} / {totalNumberOfVotes} {totalNumberOfVotes, plural, =0 {tokens} one {token} other {tokens}} left.',
  },
  creditsLeft: {
    id: 'app.components.VoteInputs._shared.creditsLeft',
    defaultMessage:
      'You have {votesLeft} / {totalNumberOfVotes} {totalNumberOfVotes, plural, =0 {credits} one {credit} other {credits}} left.',
  },
  // To remove
  vote: {
    id: 'app.components.ParticipationCTABars.votesCounter.vote',
    defaultMessage: 'vote',
  },
  // To remove
  votes: {
    id: 'app.components.ParticipationCTABars.votesCounter.votes',
    defaultMessage: 'votes',
  },
});
