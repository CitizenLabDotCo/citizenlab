import { defineMessages } from 'react-intl';

export default defineMessages({
  moderatorsNotFound: {
    id: 'app.containers.AdminPage.groups.permissions.moderatorsNotFound',
    defaultMessage: 'Moderators not found',
  },
  pendingInvitation: {
    id: 'app.containers.AdminPage.groups.permissions.pendingInvitation',
    defaultMessage: 'Pending invitation',
  },
  moderatorDeletionConfirmation: {
    id: 'app.containers.AdminPage.groups.permissions.moderatorDeletionConfirmation',
    defaultMessage: 'Are you sure?',
  },
  deleteModeratorLabel: {
    id: 'app.containers.AdminPage.groups.permissions.deleteModeratorLabel',
    defaultMessage: 'Delete',
  },
  cannotDeleteFolderModerator: {
    id: 'app.containers.AdminPage.groups.permissions.cannotDeleteFolderModerator',
    defaultMessage:
      'This user moderates the folder containing this project. To remove their moderator rights for this project, you can either revoke their folder rights or move the project to a different folder.',
  },
});
