import { defineMessages } from 'react-intl';

export default defineMessages({
  projectManagementTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.projectManagementTitle',
    defaultMessage: 'Project management',
  },
  projectManagerTooltipContent: {
    id: 'app.containers.AdminPage.ProjectEdit.projectManagerTooltipContent',
    defaultMessage:
      'Project managers can edit projects, manage inputs and email participants. You can {moderationInfoCenterLink} to find more information about the rights assigned to project managers.',
  },
  moderationInfoCenterLinkText: {
    id: 'app.containers.AdminPage.ProjectEdit.moderationInfoCenterLinkText',
    defaultMessage: 'visit our Help Center',
  },
  moreInfoModeratorLink: {
    id: 'app.containers.AdminPage.ProjectEdit.moreInfoModeratorLink',
    defaultMessage:
      'http://support.govocal.com/en-your-citizenlab-platform-step-by-step/set-up/pointing-out-the-right-project-moderators',
  },
  moderatorSearchFieldLabel: {
    id: 'app.containers.AdminPage.ProjectEdit.moderatorSearchFieldLabel1',
    defaultMessage: 'Who are the project managers?',
  },
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
  addModerators: {
    id: 'app.components.UserSearch.addModerators',
    defaultMessage: 'Add',
  },
  searchUsers: {
    id: 'app.components.UserSearch.searchUsers',
    defaultMessage: 'Type to search users...',
  },
  cannotDeleteFolderModerator: {
    id: 'app.containers.AdminPage.groups.permissions.cannotDeleteFolderModerator',
    defaultMessage:
      'This user moderates the folder containing this project. To remove their moderator rights for this project, you can either revoke their folder rights or move the project to a different folder.',
  },
});
