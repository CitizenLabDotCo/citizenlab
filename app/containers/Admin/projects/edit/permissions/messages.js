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
    defaultMessage: `Select one or more groups that can access this project`,
  },
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
  save: {
    id: 'app.containers.AdminPage.groups.permissions.save',
    defaultMessage: 'Save',
  },
  saveSuccess: {
    id: 'app.containers.AdminPage.groups.permissions.saveSuccess',
    defaultMessage: 'Success!',
  },
  saveErrorMessage: {
    id: 'app.containers.AdminPage.groups.permissions.saveErrorMessage',
    defaultMessage: 'Something went wrong, please try again later.',
  },
  saveSuccessMessage: {
    id: 'app.containers.AdminPage.groups.permissions.saveSuccessMessage',
    defaultMessage: 'Your changes have been saved.',
  },
  granularPermissionsTitle: {
    id: 'app.containers.AdminPage.groups.permissions.granularPermissionsTitle',
    defaultMessage: 'Who can take which action?',
  },
  permissionAction_commenting: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_commenting',
    defaultMessage: 'Commenting',
  },
  permissionAction_voting: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_voting',
    defaultMessage: 'Voting',
  },
  permissionAction_posting: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_posting',
    defaultMessage: 'Posting ideas',
  },
  permissionAction_taking_survey: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_taking_survey',
    defaultMessage: 'Taking the survey',
  },
  noActionsCanBeTaken: {
    id: 'app.containers.AdminPage.groups.permissions.noActionsCanBeTaken',
    defaultMessage: 'No permissions to configure, since the user can\'t do anything here',
  },
});
