import { defineMessages } from 'react-intl';

export default defineMessages({
  deleteFolderError: {
    id: 'app.containers.Admin.projects.all.deleteFolderError',
    defaultMessage:
      'There was an issue removing this folder. Please try again.',
  },
  deleteFolderConfirmation: {
    id: 'app.containers.Admin.projects.all.deleteFolderConfirm',
    defaultMessage:
      'Are you sure you want to delete this folder? All of the projects within the folder will also be deleted. This action cannot be undone.',
  },
  deleteFolderButton: {
    id: 'app.containers.Admin.projects.all.deleteFolderButton',
    defaultMessage: 'Delete',
  },
});
