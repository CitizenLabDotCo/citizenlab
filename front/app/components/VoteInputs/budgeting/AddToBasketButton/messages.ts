import { defineMessages } from 'react-intl';

export default defineMessages({
  added: {
    id: 'app.components.AssignBudgetControl.added',
    defaultMessage: 'Added',
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
  basketAlreadySubmitted: {
    id: 'app.components.VoteInputs.budgeting.AddToBasketButton.basketAlreadySubmitted',
    defaultMessage:
      'You have already submitted your budget. Click "Modify your budget" to change your budget.',
  },
  basketAlreadySubmittedIdeaPage: {
    id: 'app.components.VoteInputs.budgeting.AddToBasketButton.basketAlreadySubmittedIdeaPage',
    defaultMessage:
      'You have already submitted your budget. To change your budget, go back to the project page and click "Modify your budget".',
  },
  phaseNotActive: {
    id: 'app.components.VoteInputs.budgeting.AddToBasketButton.phaseNotActive',
    defaultMessage:
      'Budgeting is not available, since this phase is not active.',
  },
});
