import { defineMessages } from 'react-intl';

export default defineMessages({
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
  edit: {
    id: 'app.components.admin.PostManager.edit',
    defaultMessage: 'Edit',
  },
  delete: {
    id: 'app.components.admin.PostManager.delete',
    defaultMessage: 'Delete',
  },
});
