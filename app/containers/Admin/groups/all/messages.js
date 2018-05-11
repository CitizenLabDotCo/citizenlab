import { defineMessages } from 'react-intl';

export default defineMessages({
  listTitle: {
    id: 'app.containers.AdminPage.Groups.listTitle',
    defaultMessage: 'Groups',
  },
  members: {
    id: 'app.containers.AdminPage.groups.list.members',
    defaultMessage: '{count, plural, =0 {No members} one {one member} other {{count} members}}',
  },
  addGroupButton: {
    id: 'app.containers.AdminPage.groups.list.addGroupButton',
    defaultMessage: 'Add a group',
  },
  emptyListMessage: {
    id: 'app.containers.AdminPage.groups.list.emptyListMessage',
    defaultMessage: 'You don’t have any group of users yet.',
  },
  loadingMessage: {
    id: 'app.containers.AdminPage.groups.list.loadingMessage',
    defaultMessage: 'Loading the list of groups…',
  },
  deleteButtonLabel: {
    id: 'app.containers.AdminPage.groups.list.deleteButtonLabel',
    defaultMessage: 'Delete',
  },
  groupDeletionConfirmation: {
    id: 'app.containers.AdminPage.groups.list.groupDeletionConfirmation',
    defaultMessage: 'Are you sure you want to delete this group?',
  },
  editButtonLabel: {
    id: 'app.containers.AdminPage.groups.list.editButtonLabel',
    defaultMessage: 'Edit',
  },
  groupTitleLabel: {
    id: 'app.containers.AdminPage.groups.list.groupTitleLabel',
    defaultMessage: 'Group name',
  },
  creationFormTitle: {
    id: 'app.containers.AdminPage.groups.create.creationFormTitle',
    defaultMessage: 'Create a new group',
  },
  buttonSave: {
    id: 'app.containers.AdminPage.groups.create.buttonSave',
    defaultMessage: 'Save',
  },
  buttonError: {
    id: 'app.containers.AdminPage.groups.create.buttonError',
    defaultMessage: 'Error',
  },
  buttonSuccess: {
    id: 'app.containers.AdminPage.groups.create.buttonSuccess',
    defaultMessage: 'Success',
  },
  messageSuccess: {
    id: 'app.containers.AdminPage.groups.create.messageSuccess',
    defaultMessage: 'Your group has been created',
  },
  messageError: {
    id: 'app.containers.AdminPage.groups.create.messageError',
    defaultMessage: 'There was an error creating your group',
  },
  dropdownFooterMessage: {
    id: 'app.containers.AdminPage.groups.create.dropdownFooterMessage',
    defaultMessage: 'Add users',
  },
});
