import { defineMessages } from 'react-intl';

export default defineMessages({
  youHave: {
    id: 'app.components.AssignVoteControl.youHave',
    defaultMessage: 'You have',
  },
  a11y_price: {
    id: 'app.components.AssignBudgetControl.a11y_price',
    defaultMessage: 'Price: ',
  },
  currencyLeft: {
    id: 'app.components.VoteInputs._shared.currencyLeft',
    defaultMessage: 'You have {budgetLeft} / {totalBudget} {currency} left',
  },
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
