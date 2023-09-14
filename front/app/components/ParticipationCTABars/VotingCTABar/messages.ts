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
    id: 'app.components.ParticipationCTABars.VotingCTABar.noVotesCast2',
    defaultMessage: 'You need to vote before you can submit your {votesTerm}.',
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
    id: 'app.components.ParticipationCTABars.VotingCTABar.minBudgetNotReached2',
    defaultMessage:
      'You need to spend a minimum of {votesMinimum} {currency} before you can submit your basket.',
  },

  // votes count
  currencyLeft: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.currencyLeft',
    defaultMessage: '{budgetLeft} / {totalBudget} {currency} left',
  },
  votesLeft: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.votesLeft2',
    defaultMessage:
      '{votesLeft} / {totalNumberOfVotes} {totalNumberOfVotes, plural, =0 {{votesTerm}} one {{voteTerm}} other {{votesTerm}}} left',
  },
  votesCast: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.votesCast',
    defaultMessage:
      '{votes, plural, =0 {# votes} one {# vote} other {# votes}} cast',
  },
});
