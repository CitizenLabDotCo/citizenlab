import { defineMessages } from 'react-intl';

export default defineMessages({
  // voting disabled explanations
  // votesExceedLimit probably can't ever happen
  votesExceedLimit: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.votesExceedLimit',
    defaultMessage:
      'You cast {votesCast} votes, which exceeds the limit of {votesLimit}. Please remove some votes and try again.',
  },
  noVotesCast: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.noVotesCast3',
    defaultMessage: 'You need to vote before you can submit.',
  },

  // budgeting disabled explanations
  budgetExceedsLimit: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.budgetExceedsLimit',
    defaultMessage:
      'You spent {votesCast}, which exceeds the limit of {votesLimit}. Please remove some items from your basket and try again.',
  },
  nothingInBasket: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.nothingInBasket',
    defaultMessage:
      'You need to add something to your basket before you can submit it.',
  },
  minBudgetNotReached1: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.minBudgetNotReached1',
    defaultMessage:
      'You need to spend a minimum of {votesMinimum} before you can submit your basket.',
  },

  // votes count
  currencyLeft1: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.currencyLeft1',
    defaultMessage: '{budgetLeft} / {totalBudget} left',
  },
  votesLeft: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.votesLeft3',
    defaultMessage:
      '{votesLeft} / {totalNumberOfVotes} {totalNumberOfVotes, plural, =0 {votes} one {vote} other {votes}} left',
  },
  pointsLeft: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.pointsLeft',
    defaultMessage:
      '{votesLeft} / {totalNumberOfVotes} {totalNumberOfVotes, plural, =0 {points} one {point} other {points}} left',
  },
  tokensLeft: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.tokensLeft',
    defaultMessage:
      '{votesLeft} / {totalNumberOfVotes} {totalNumberOfVotes, plural, =0 {tokens} one {token} other {tokens}} left',
  },
  creditsLeft: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.creditsLeft',
    defaultMessage:
      '{votesLeft} / {totalNumberOfVotes} {totalNumberOfVotes, plural, =0 {credits} one {credit} other {credits}} left',
  },
  votesCast: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.votesCast',
    defaultMessage:
      '{votes, plural, =0 {# votes} one {# vote} other {# votes}} cast',
  },
  stillHaveVotesLeft: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.stillHaveVotesLeft',
    defaultMessage:
      'You still have {votesLeft} {votesTerm} left to distribute.',
  },
  stillHaveVotesLeftDescription: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.stillHaveVotesLeftDescription',
    defaultMessage:
      'You can still distribute more {votesTerm} amongst different options, are you sure you want to submit?',
  },
  seeOtherOptions: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.seeOtherOptions2',
    defaultMessage: 'See options',
  },
});
