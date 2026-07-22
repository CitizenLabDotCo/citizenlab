import { defineMessages } from 'react-intl';

export default defineMessages({
  giveManagerRights: {
    id: 'app.containers.admin.addCollaboratorsModal.giveManagerRights',
    defaultMessage: 'Give manager rights',
  },
  giveAdminRights: {
    id: 'app.containers.admin.addCollaboratorsModal.giveAdminRights',
    defaultMessage: 'Give admin rights',
  },
  hasReachedOrIsOverLimit: {
    id: 'app.containers.admin.addCollaboratorsModal.hasReachedOrIsOverLimit',
    defaultMessage:
      'You have reached the limit of included seats within your plan, {noOfSeats} additional {noOfSeats, plural, one {seat} other {seats}} will be added.',
  },
  buyAdditionalSeats: {
    id: 'app.containers.admin.addCollaboratorsModal.buyAdditionalSeats1',
    defaultMessage: 'Buy 1 additional seat',
  },
});
