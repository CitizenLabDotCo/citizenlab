import { defineMessages } from 'react-intl';

export default defineMessages({
  remove: {
    id: 'app.components.AssignBudgetControl.remove',
    defaultMessage: 'Remove',
  },
  add: {
    id: 'app.components.AssignBudgetControl.add',
    defaultMessage: 'Add',
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
  verifyAccountLinkText: {
    id: 'app.components.AssignBudgetControl.verifyAccountLinkText',
    defaultMessage: 'verify your account',
  },
  a11y_price: {
    id: 'app.components.AssignBudgetControl.a11y_price',
    defaultMessage: 'Price: ',
  },
  backToOverview: {
    id: 'app.components.AssignBudgetControl.backToOverview',
    defaultMessage: 'Back to overview',
  },
});
