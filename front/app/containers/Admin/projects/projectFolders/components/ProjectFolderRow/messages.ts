import { defineMessages } from 'react-intl';

export default defineMessages({
  edit: {
    id: 'app.containers.Admin.projects.all.components.manageButtonLabel',
    defaultMessage: 'Edit',
  },
  deleteFolderError: {
    id: 'app.containers.Admin.projects.all.deleteFolderError',
    defaultMessage:
      'There was an issue removing this folder. Please try again.',
  },
  deleteFolderButton: {
    id: 'app.containers.Admin.projects.all.deleteFolderButton1',
    defaultMessage: 'Delete folder',
  },
  deleteFolderModalTitle: {
    id: 'app.containers.Admin.projects.all.deleteFolderModalTitle',
    defaultMessage: 'Delete this folder permanently?',
  },
  deleteFolderModalWarning: {
    id: 'app.containers.Admin.projects.all.deleteFolderModalWarning1',
    defaultMessage:
      'This will permanently delete this folder and ALL projects within it, along with any associated data such as ideas, comments, votes, and survey responses.',
  },
});
