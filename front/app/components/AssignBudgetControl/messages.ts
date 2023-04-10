import { defineMessages } from 'react-intl';

export default defineMessages({
  remove: {
    id: 'app.components.AssignBudgetControl.remove',
    defaultMessage: 'Remove',
  },
  removeFromMyBasket: {
    id: 'app.components.AssignBudgetControl.removeFromMyBasket',
    defaultMessage: 'Remove from my basket',
  },
  add: {
    id: 'app.components.AssignBudgetControl.add',
    defaultMessage: 'Add',
  },
  addToMyBasket: {
    id: 'app.components.AssignBudgetControl.addToMyBasket',
    defaultMessage: 'Add to my basket',
  },
  budgetingNotPossible: {
    id: 'app.components.VoteControl.budgetingNotPossible',
    defaultMessage:
      'Making changes to your budget is not possible at this time.',
  },
  budgetingFutureEnabled: {
    id: 'app.components.VoteControl.budgetingFutureEnabled',
    defaultMessage:
      'You can allocate your budget starting from {enabledFromDate}.',
  },
  budgetingNotPermitted: {
    id: 'app.components.VoteControl.budgetingNotPermitted',
    defaultMessage:
      'Participatory budgeting is only enabled for certain groups.',
  },
  budgetingNotVerified: {
    id: 'app.components.VoteControl.budgetingNotVerified',
    defaultMessage: 'Please {verifyAccountLink} to continue.',
  },
  a11y_price: {
    id: 'app.components.AssignBudgetControl.a11y_price',
    defaultMessage: 'Price: ',
  },
});
