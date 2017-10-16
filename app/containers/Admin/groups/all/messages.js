import { defineMessages } from 'react-intl';

export default defineMessages({
  listTitle: {
    id: 'app.containers.AdminPage.Groups.listTitle',
    defaultMessage: 'Groups of users',
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
  editButtonLabel: {
    id: 'app.containers.AdminPage.groups.list.editButtonLabel',
    defaultMessage: 'Edit',
  },
});
