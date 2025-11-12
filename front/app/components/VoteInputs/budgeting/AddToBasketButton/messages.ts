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

  budgetingNotPermitted: {
    id: 'app.components.VoteControl.budgetingNotPermitted',
    defaultMessage:
      'Participatory budgeting is only enabled for certain groups.',
  },
  budgetingNotVerified: {
    id: 'app.components.VoteControl.budgetingNotVerified',
    defaultMessage: 'Please {verifyAccountLink} to continue.',
  },
  basketAlreadySubmitted1: {
    id: 'app.components.VoteInputs.budgeting.AddToBasketButton.basketAlreadySubmitted1',
    defaultMessage:
      'You have already submitted your budget. To modify it, click "Modify your submission".',
  },
  basketAlreadySubmittedIdeaPage1: {
    id: 'app.components.VoteInputs.budgeting.AddToBasketButton.basketAlreadySubmittedIdeaPage1',
    defaultMessage:
      'You have already submitted your budget. To modify it, go back to the project page and click "Modify your submission".',
  },
  phaseNotActive: {
    id: 'app.components.VoteInputs.budgeting.AddToBasketButton.phaseNotActive',
    defaultMessage:
      'Budgeting is not available, since this phase is not active.',
  },
});
