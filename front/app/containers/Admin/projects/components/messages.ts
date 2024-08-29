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
  copyProjectError: {
    id: 'app.containers.Admin.projects.all.copyProjectError',
    defaultMessage:
      'There was an error copying this project, please try again later.',
  },
  deleteProjectButtonFull: {
    id: 'app.containers.Admin.projects.all.deleteProjectButtonFull',
    defaultMessage: 'Delete project',
  },
  copyProjectButton: {
    id: 'app.containers.Admin.projects.all.copyProjectButton',
    defaultMessage: 'Copy project',
  },
  xGroupsHaveAccess: {
    id: 'app.containers.AdminPage.ProjectEdit.xGroupsHaveAccess',
    defaultMessage:
      '{groupCount, plural, no {# groups can view} one {# group can view} other {# groups can view}}',
  },
  onlyAdminsCanView: {
    id: 'app.containers.AdminPage.ProjectEdit.onlyAdminsCanView',
    defaultMessage: 'Only admins can view',
  },
  editButtonLabel: {
    id: 'app.containers.AdminPage.ProjectEdit.editButtonLabel',
    defaultMessage: 'Edit',
  },
});
