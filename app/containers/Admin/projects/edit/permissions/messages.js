import { defineMessages } from 'react-intl';

export default defineMessages({
  permissionsTitle: {
    id: 'app.containers.admin.project.permissions.permissionsTitle',
    defaultMessage: 'Access',
  },
  permissionsSubtitle: {
    id: 'app.containers.admin.project.permissions.permissionsSubtitle',
    defaultMessage: 'People that can access this project',
  },
  permissionTypeLabel: {
    id: 'app.containers.admin.project.permissions.permissionTypeLabel',
    defaultMessage: 'Who can view this project?',
  },
  permissionsEveryoneLabel: {
    id: 'app.containers.admin.project.permissions.permissionsEveryoneLabel',
    defaultMessage: 'Everyone',
  },
  permissionsAdministrators: {
    id: 'app.containers.admin.project.permissions.permissionsAdministrators',
    defaultMessage: 'Administrators',
  },
  permissionsSelectionLabel: {
    id: 'app.containers.admin.project.permissions.permissionsSelectionLabel',
    defaultMessage: 'Selection',
  },
  noSelectedGroupsMessage: {
    id: 'app.containers.AdminPage.groups.permissions.noSelectedGroupsMessage',
    defaultMessage: 'You don’t have <strong>any group</strong> of users yet.',
  },
  addGroup: {
    id: 'app.containers.AdminPage.groups.permissions.addGroup',
    defaultMessage: 'Add group(s)',
  },
  groupsMultipleSelectPlaceholder: {
    id: 'app.containers.AdminPage.groups.permissions.groupsMultipleSelectPlaceholder',
    defaultMessage: 'Select group(s)',
  },
  members: {
    id: 'app.containers.AdminPage.groups.permissions.members',
    defaultMessage: '{count, plural, =0 {No members} one {1 member} other {{count} members}}',
  },
  deleteButtonLabel: {
    id: 'app.containers.AdminPage.groups.permissions.deleteButtonLabel',
    defaultMessage: 'Delete',
  },
  editButtonLabel: {
    id: 'app.containers.AdminPage.groups.permissions.editButtonLabel',
    defaultMessage: 'Edit',
  },
  groupDeletionConfirmation: {
    id: 'app.containers.AdminPage.groups.permissions.groupDeletionConfirmation',
    defaultMessage: 'Are you sure you want to remove this group from the project?',
  },
});
