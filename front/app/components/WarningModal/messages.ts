import { defineMessages } from 'react-intl';

export default defineMessages({
  cancel: {
    id: 'app.components.admin.PostManager.components.PostTable.Row.cancel',
    defaultMessage: 'Cancel',
  },
  confirm: {
    id: 'app.components.admin.PostManager.components.PostTable.Row.confirm',
    defaultMessage: 'Confirm',
  },
  deleteInputTitle: {
    id: 'app.components.admin.PostManager.components.ActionBar.deleteInputTitle',
    defaultMessage: 'Are you sure you want to delete this input?',
  },
  deleteInitiativeTitle: {
    id: 'app.components.admin.PostManager.components.ActionBar.deleteInitiativeTitle',
    defaultMessage: 'Are you sure you want to delete this initiative?',
  },
  deleteInputExplanation: {
    id: 'app.components.admin.PostManager.components.ActionBar.deleteInputExplanation',
    defaultMessage:
      'This means you will lose all data associated with this input, like comments, reactions and votes. This action cannot be undone.',
  },
  deleteInitiativeExplanation: {
    id: 'app.components.admin.PostManager.components.ActionBar.deleteInitiativeExplanation',
    defaultMessage:
      'This means you will lose all data associated with this initiative, like comments and votes. This action cannot be undone.',
  },
});
