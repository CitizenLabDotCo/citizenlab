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
  deleteProjectModalTitle: {
    id: 'app.containers.Admin.projects.all.deleteProjectModalTitle',
    defaultMessage: 'Delete this project permanently?',
  },
  deleteProjectModalWarning: {
    id: 'app.containers.Admin.projects.all.deleteProjectModalWarning',
    defaultMessage:
      'This will permanently delete this project and all of its data, including all ideas, comments, votes, and survey responses.',
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
