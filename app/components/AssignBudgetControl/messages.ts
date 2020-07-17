import { defineMessages } from 'react-intl';

export default defineMessages({
  assign: {
    id: 'app.components.AssignBudgetControl.assign',
    defaultMessage: 'Assign',
  },
  undo: {
    id: 'app.components.AssignBudgetControl.undo',
    defaultMessage: 'Undo',
  },
  seeIdea: {
    id: 'app.components.AssignBudgetControl.seeIdea',
    defaultMessage: 'See idea',
  },
  assigned: {
    id: 'app.components.AssignBudgetControl.assigned',
    defaultMessage: 'Assigned',
  },
  budgetingDisabled: {
    id: 'app.components.VoteControl.budgetingDisabled',
    defaultMessage:
      'Sorry. Assigning budget to this idea is no longer possible.',
  },
  budgetingDisabledFutureEnabled: {
    id: 'app.components.VoteControl.budgetingDisabledFutureEnabled',
    defaultMessage:
      'Sorry. Assigning budget to this idea is currently not yet possible. It will be enabled starting from {enabledFromDate}.',
  },
  budgetingDisabledNotPermitted: {
    id: 'app.components.VoteControl.budgetingDisabledNotPermitted',
    defaultMessage:
      "Sorry. You don't have the permission to assign budget to this idea.",
  },
  budgetingDisabledNotVerified: {
    id: 'app.components.VoteControl.budgetingDisabledNotVerified',
    defaultMessage:
      'You have to verify your account to assign budget to this idea. {verificationLink}',
  },
  verificationLinkText: {
    id: 'app.components.AssignBudgetControl.verificationLinkText',
    defaultMessage: 'Verify your account now.',
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
