import { defineMessages } from 'react-intl';

export default defineMessages({
  members: {
    id: 'app.containers.AdminPage.groups.list.members',
    defaultMessage: '{count, plural, =0 {No members} one {one member} other {{count} members}}',
  },
  emptyListMessage: {
    id: 'app.containers.AdminPage.groups.list.emptyListMessage',
    defaultMessage: 'You don’t have any group of users yet.',
  },
  loadingMessage: {
    id: 'app.containers.AdminPage.groups.list.loadingMessage',
    defaultMessage: 'Loading…',
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
