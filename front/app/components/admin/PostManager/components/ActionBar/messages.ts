import { defineMessages } from 'react-intl';

export default defineMessages({
  // ActionBarSingle
  edit: {
    id: 'app.components.admin.PostManager.edit',
    defaultMessage: 'Edit',
  },
  delete: {
    id: 'app.components.admin.PostManager.delete',
    defaultMessage: 'Delete',
  },

  // ActionBarMulti
  deleteInputsTitle: {
    id: 'app.components.admin.PostManager.components.ActionBar.deleteInputsTitle',
    defaultMessage: 'Are you sure you want to delete these inputs?',
  },
  deleteInitiativesTitle: {
    id: 'app.components.admin.PostManager.components.ActionBar.deleteInitiativesTitle',
    defaultMessage: 'Are you sure you want to delete these initiatives?',
  },
  deleteInputsExplanation: {
    id: 'app.components.admin.PostManager.components.ActionBar.deleteInputsExplanation',
    defaultMessage:
      'This means you will lose all data associated with these inputs, like comments, reactions and votes. This action cannot be undone.',
  },
  deleteInitiativesExplanation: {
    id: 'app.components.admin.PostManager.components.ActionBar.deleteInitiativesExplanation',
    defaultMessage:
      'This means you will lose all data associated with these initiatives, like comments and votes. This action cannot be undone.',
  },

  deleteAllSelectedInputs: {
    id: 'app.components.admin.PostManager.deleteAllSelectedInputs',
    defaultMessage: 'Delete {count} inputs',
  },
  deleteAllSelectedInitiatives: {
    id: 'app.components.admin.PostManager.deleteAllSelectedInitiatives',
    defaultMessage: 'Delete {count} selected initiatives',
  },
});
