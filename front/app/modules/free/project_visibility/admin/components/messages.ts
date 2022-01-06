import { defineMessages } from 'react-intl';

export default defineMessages({
  add: {
    id: 'app.containers.AdminPage.groups.permissions.add',
    defaultMessage: 'Add',
  },
  groupsMultipleSelectPlaceholder: {
    id: 'app.containers.AdminPage.groups.permissions.groupsMultipleSelectPlaceholder',
    defaultMessage: 'Select one or more groups',
  },
  members: {
    id: 'app.containers.AdminPage.groups.permissions.members',
    defaultMessage:
      '{count, plural, =0 {No members} one {1 member} other {{count} members}}',
  },
  deleteButtonLabel: {
    id: 'app.containers.AdminPage.groups.permissions.deleteButtonLabel',
    defaultMessage: 'Delete',
  },
  groupDeletionConfirmation: {
    id: 'app.containers.AdminPage.groups.permissions.groupDeletionConfirmation',
    defaultMessage:
      'Are you sure you want to remove this group from the project?',
  },
  permissionsTab: {
    id: 'app.containers.AdminPage.ProjectEdit.permissionsTab',
    defaultMessage: 'Access rights',
  },
});
