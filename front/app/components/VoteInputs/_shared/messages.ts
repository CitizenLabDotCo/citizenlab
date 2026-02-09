import { defineMessages } from 'react-intl';

export default defineMessages({
  numberOfVotesLeft: {
    id: 'app.components.VoteInputs._shared.numberOfVotesLeft',
    defaultMessage:
      'You have {votesLeft, plural, =0 {no votes left} other {# out of {totalNumberOfVotes, plural, one {1 vote} other {# votes}} left}}.',
  },
  numberOfPointsLeft: {
    id: 'app.components.VoteInputs._shared.numberOfPointsLeft',
    defaultMessage:
      'You have {votesLeft, plural, =0 {no points left} other {# out of {totalNumberOfVotes, plural, one {1 point} other {# points}} left}}.',
  },
  numberOfTokensLeft: {
    id: 'app.components.VoteInputs._shared.numberOfTokensLeft',
    defaultMessage:
      'You have {votesLeft, plural, =0 {no tokens left} other {# out of {totalNumberOfVotes, plural, one {1 token} other {# tokens}} left}}.',
  },
  numberOfCreditsLeft: {
    id: 'app.components.VoteInputs._shared.numberOfCreditsLeft',
    defaultMessage:
      'You have {votesLeft, plural, =0 {no credits left} other {# out of {totalNumberOfVotes, plural, one {1 credit} other {# credits}} left}}.',
  },
  numberOfPercentsLeft: {
    id: 'app.components.VoteInputs._shared.numberOfPercentsLeft6',
    defaultMessage:
      'You have {votesLeft, plural, =0 {no % left} other {#% left}}.',
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
