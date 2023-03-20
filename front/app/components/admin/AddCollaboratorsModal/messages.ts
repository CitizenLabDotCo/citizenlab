import { defineMessages } from 'react-intl';

export default defineMessages({
  giveCollaboratorRights: {
    id: 'app.containers.admin.addCollaboratorsModal.giveCollaboratorRights',
    defaultMessage: 'Give collaborator rights',
  },
  reachedLimitText: {
    id: 'app.containers.admin.addCollaboratorsModal.reachedLimitText',
    defaultMessage:
      'You have reached the limit of included seats within your plan, {noOfSeats} additional {noOfSeats, plural, one {seat} other {seats}} will be added.',
  },
  buyAdditionalSeats: {
    id: 'app.containers.admin.addCollaboratorsModal.buyAdditionalSeats',
    defaultMessage:
      'Buy {noOfSeats} additional {noOfSeats, plural, one {seat} other {seats}}',
  },
  confirmMessage: {
    id: 'app.containers.admin.addCollaboratorsModal.confirmMessage',
    defaultMessage:
      'Are you sure you want to give {noOfPeople} {noOfPeople, plural, one {person} other {people}} collaborator rights?',
  },
  confirmButtonText: {
    id: 'app.containers.admin.addCollaboratorsModal.confirmButtonText',
    defaultMessage: 'Confirm',
  },
});
