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
    id: 'app.containers.AdminPage.groups.permissions.moderatorDeletionConfirmation',
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
  permissionsTab: {
    id: 'app.modules.project_management.admin.components.permissionsTab',
    defaultMessage: 'Access rights',
  },
  giveCollaboratorRights: {
    id: 'app.modules.project_management.admin.components.giveCollaboratorRights',
    defaultMessage: 'Give collaborator rights',
  },
  reachedLimitMessage: {
    id: 'app.modules.project_management.admin.components.reachedLimitMessage',
    defaultMessage:
      'You have reached the limit of included seats within your plan, {noOfSeats} additional seats will be added.',
  },
  buyAdditionalSeats: {
    id: 'app.modules.project_management.admin.components.buyAdditionalSeats',
    defaultMessage:
      'Buy {noOfSeats} additional {noOfSeats, plural, one {seat} other {seats}}',
  },
  confirmMessage: {
    id: 'app.modules.project_management.admin.components.confirmMessage',
    defaultMessage:
      'Are you sure you want to give {noOfPeople} {noOfPeople, plural, one {person} other {people}} collaborator rights?',
  },
  confirmButtonText: {
    id: 'app.modules.project_management.admin.components.confirmButtonText',
    defaultMessage: 'Confirm',
  },
});
