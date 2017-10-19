import { defineMessages } from 'react-intl';

export default defineMessages({
  listTitle: {
    id: 'app.containers.AdminPage.group.edit.listTitle',
    defaultMessage: 'Group',
  },
  emptyListMessage: {
    id: 'app.containers.AdminPage.group.edit.emptyListMessage',
    defaultMessage: 'You don’t have any members in this group yet.',
  },
  loadingMessage: {
    id: 'app.containers.AdminPage.group.edit.loadingMessage',
    defaultMessage: 'Loading the list of members…',
  },
  deleteLabel: {
    id: 'app.containers.AdminPage.group.edit.deleteLabel',
    defaultMessage: 'Remove',
  },
  deleteConfirmMessage: {
    id: 'app.containers.AdminPage.group.edit.deleteConfirmMessage',
    defaultMessage: 'Are you sure you want to remove this member from the group?',
  },
  goBack: {
    id: 'app.containers.AdminPage.group.edit.goBack',
    defaultMessage: 'Go back',
  },
});
