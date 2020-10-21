import { defineMessages } from 'react-intl';

export default defineMessages({
  manageButtonLabel: {
    id: 'app.containers.Admin.projects.all.components.manageButtonLabel',
    defaultMessage: 'Manage',
  },
  archived: {
    id: 'app.containers.Admin.projects.all.components.archived',
    defaultMessage: 'Archived',
  },
  draft: {
    id: 'app.containers.Admin.projects.all.components.draft',
    defaultMessage: 'Draft',
  },
  deleteProjectConfirmation: {
    id: 'app.containers.AdminPage.ProjectEdit.deleteProjectConfirmation',
    defaultMessage:
      'Are you sure you want to delete this project? This cannot be undone.',
  },
  deleteProjectError: {
    id: 'app.containers.AdminPage.ProjectEdit.deleteProjectError',
    defaultMessage:
      'There was an error deleting this project, please try again later.',
  },
  deleteProjectLabel: {
    id: 'app.containers.AdminPage.ProjectEdit.deleteProjectLabel',
    defaultMessage: 'Remove this project',
  },
  deleteProjectLabelTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.deleteProjectLabelTooltip',
    defaultMessage:
      'This action will delete the project and all of its content. If you want to keep it but not show it anymore, change its publication status to ‘draft’. Or to ‘archived’ when it should remain visible while blocking participation.',
  },
  deleteProjectButton: {
    id: 'app.containers.AdminPage.ProjectEdit.deleteProjectButton',
    defaultMessage: 'Remove',
  },
  deleteFolderError: {
    id: 'app.containers.AdminPage.FoldersEdit.deleteFolderError',
    defaultMessage:
      'There was an issue removing this folder. Please try again.',
  },
  deleteFolderConfirmation: {
    id: 'app.containers.AdminPage.FoldersEdit.deleteFolderConfirmation',
    defaultMessage:
      'Are you sure you want to delete this folder and all the projects it contains?',
  },
  deleteFolderLabelTooltip: {
    id: 'app.containers.AdminPage.FoldersEdit.deleteFolderLabelTooltip',
    defaultMessage: 'This will remove this folder and all the projects inside.',
  },
  deleteFolderLabel: {
    id: 'app.containers.AdminPage.FoldersEdit.deleteFolderLabel',
    defaultMessage: 'Delete',
  },
});
