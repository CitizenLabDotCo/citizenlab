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
  budgetingDisabledProjectInactive: {
    id: 'app.components.VoteControl.budgetingDisabledProjectInactive',
    defaultMessage: 'You can no longer or not yet assign budgets on ideas in {projectName}',
  },
  budgetingDisabledNotInActiveContext: {
    id: 'app.components.VoteControl.budgetingDisabledNotInActiveContext',
    defaultMessage: 'This idea is no longer or not yet considered in {projectName}',
  },
  budgetingDisabledNotPermitted: {
    id: 'app.components.VoteControl.budgetingDisabledNotPermitted',
    defaultMessage: 'Unfortunately, you don\'t have the rights to assign a budget for this idea',
  },

});
