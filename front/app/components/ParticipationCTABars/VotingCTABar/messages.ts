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
    id: 'app.components.ParticipationCTABars.VotingCTABar.noVotesCast4',
    defaultMessage:
      'You need to select at least one option before you can submit.',
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

  // Minimum selected options
  selectMinXOptions: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.selectMinXOptions',
    defaultMessage: 'Select at least {minSelectedOptions} options',
  },
  selectMinXOptionsToVote: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.selectMinXOptionsToVote',
    defaultMessage:
      'You need to select at least {minSelectedOptions} options before you can submit.',
  },

  // votes count
  currencyLeft1: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.currencyLeft1',
    defaultMessage: '{budgetLeft} / {totalBudget} left',
  },
  numberOfVotesLeft: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.numberOfVotesLeft',
    defaultMessage:
      '{votesLeft, plural, =0 {No votes left} other {# out of {totalNumberOfVotes, plural, one {1 vote} other {# votes}} left}}',
  },
  numberOfPointsLeft: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.numberOfPointsLeft',
    defaultMessage:
      '{votesLeft, plural, =0 {No points left} other {# out of {totalNumberOfVotes, plural, one {1 point} other {# points}} left}}',
  },
  numberOfTokensLeft: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.numberOfTokensLeft',
    defaultMessage:
      '{votesLeft, plural, =0 {No tokens left} other {# out of {totalNumberOfVotes, plural, one {1 token} other {# tokens}} left}}',
  },
  numberOfCreditsLeft: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.numberOfCreditsLeft',
    defaultMessage:
      '{votesLeft, plural, =0 {No credits left} other {# out of {totalNumberOfVotes, plural, one {1 credit} other {# credits}} left}}',
  },
  numberOfPercentsLeft: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.numberOfPercentsLeft4',
    defaultMessage: '{votesLeft, plural, =0 {No % left} other {#% left}}',
  },
  // Only used for single voting (no vote term config available)
  votesCast: {
    id: 'app.components.ParticipationCTABars.VotingCTABar.votesCast',
    defaultMessage:
      '{votes, plural, =0 {# votes} one {# vote} other {# votes}} cast',
  },
});
