import { defineMessages } from 'react-intl';

export default defineMessages({
  archived: {
    id: 'app.containers.Admin.projects.all.components.archived',
    defaultMessage: 'Archived',
  },
  draft: {
    id: 'app.containers.Admin.projects.all.components.draft',
    defaultMessage: 'Draft',
  },
  deleteProjectConfirmation: {
    id: 'app.containers.Admin.projects.all.deleteProjectConfirmation',
    defaultMessage:
      'Are you sure you want to delete this project? This cannot be undone.',
  },
  deleteProjectError: {
    id: 'app.containers.Admin.projects.all.deleteProjectError',
    defaultMessage:
      'There was an error deleting this project, please try again later.',
  },
  deleteProjectButton: {
    id: 'app.containers.Admin.projects.all.deleteProjectButton',
    defaultMessage: 'Delete',
  },
});
