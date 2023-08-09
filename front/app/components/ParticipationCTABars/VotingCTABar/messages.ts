import { defineMessages } from 'react-intl';

export default defineMessages({
  // voting disabled explanations
  votesExceedLimit: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.votesExceedLimit',
    defaultMessage:
      'You cast {votesCast} votes, which exceeds the limit of {votesLimit}. Please remove some votes and try again.',
  },
  noVotesCast: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.noVotesCast',
    defaultMessage: 'You need to vote before you can submit your votes.',
  },
  minVotesRequiredNotReached: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.minVotesRequiredNotReached',
    defaultMessage:
      'You need to cast a minimum of {votesMinimum} votes before you can submit your votes.',
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
  minBudgetNotReached: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.minBudgetNotReached',
    defaultMessage:
      'You need to spend a minimum of {votesMinimum} votes before you can submit your basket.',
  },

  // currency or votes left
  currencyLeft: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.currencyLeft',
    defaultMessage: '{budgetLeft} / {totalBudget} {currency} left',
  },
  votesLeft: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.votesLeft',
    defaultMessage:
      '{votesLeft} / {totalNumberOfVotes} {votesLeft, plural, =0 {{votesTerm}} one {{voteTerm}} other {{votesTerm}}} left',
  },
});
