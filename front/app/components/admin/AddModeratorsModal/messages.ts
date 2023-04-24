import { defineMessages } from 'react-intl';

export default defineMessages({
  giveManagerRights: {
    id: 'app.containers.admin.addCollaboratorsModal.giveManagerRights',
    defaultMessage: 'Give manager rights',
  },
  hasReachedOrIsOverLimit: {
    id: 'app.containers.admin.addCollaboratorsModal.hasReachedOrIsOverLimit',
    defaultMessage:
      'You have reached the limit of included seats within your plan, 1 additional seat will be added.',
  },
  buyAdditionalSeats: {
    id: 'app.containers.admin.addCollaboratorsModal.buyAdditionalSeats1',
    defaultMessage: 'Buy 1 additional seat',
  },
  confirmManagerRights: {
    id: 'app.containers.admin.addCollaboratorsModal.confirmManagerRights',
    defaultMessage: 'Are you sure you want to give 1 person manager rights?',
  },
  confirmButtonText: {
    id: 'app.containers.admin.addCollaboratorsModal.confirmButtonText',
    defaultMessage: 'Confirm',
  },
});
