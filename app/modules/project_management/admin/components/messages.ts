import { defineMessages } from 'react-intl';

export default defineMessages({
  addModerators: {
    id: 'app.components.UserSearch.addModerators',
    defaultMessage: 'Add',
  },
  searchUsers: {
    id: 'app.components.UserSearch.searchUsers',
    defaultMessage: 'Type to search users...',
  },
  noOptions: {
    id: 'app.components.UserSearch.noOptions',
    defaultMessage: 'No options',
  },
  pendingInvitation: {
    id: 'app.containers.AdminPage.groups.permissions.pendingInvitation',
    defaultMessage: 'Pending invitation',
  },
  unknownName: {
    id: 'app.containers.AdminPage.groups.permissions.unknownName',
    defaultMessage: 'Unknown name',
  },
  moderatorDeletionConfirmation: {
    id:
      'app.containers.AdminPage.groups.permissions.moderatorDeletionConfirmation',
    defaultMessage: 'Are you sure?',
  },
  deleteModeratorLabel: {
    id: 'app.containers.AdminPage.groups.permissions.deleteModeratorLabel',
    defaultMessage: 'Delete',
  },
  moderatorsNotFound: {
    id: 'app.containers.AdminPage.groups.permissions.moderatorsNotFound',
    defaultMessage: 'Moderators not found',
  },
});
