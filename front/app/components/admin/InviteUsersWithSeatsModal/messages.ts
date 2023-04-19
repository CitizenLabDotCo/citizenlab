import { defineMessages } from 'react-intl';

export default defineMessages({
  confirmSeatUsageChange: {
    id: 'app.containers.admin.inviteUsersWithSeatsModal.confirmSeatUsageChange',
    defaultMessage: 'Confirm impact on seat usage',
  },
  infoMessage: {
    id: 'app.containers.admin.inviteUsersWithSeatsModal.infoMessage1',
    defaultMessage:
      'You have reached the limit of available seats within your plan. {additionalSeats} will be added over the limit.',
  },
  additionalAdminSeats: {
    id: 'app.containers.admin.inviteUsersWithSeatsModal.additionalAdminSeats',
    defaultMessage:
      '{seats, plural, one {1 additional admin seat} other {# additional admin seats}}',
  },
  additionalManagerSeats: {
    id: 'app.containers.admin.inviteUsersWithSeatsModal.additionalManagerSeats',
    defaultMessage:
      '{seats, plural, one {1 additional manager seat} other {# additional manager seats}}',
  },
  additionalAdminAndManagerSeats: {
    id: 'app.containers.admin.inviteUsersWithSeatsModal.additionalAdminAndManagerSeats',
    defaultMessage:
      '{adminSeats, plural, one {1 additional admin seat} other {# additional admin seats}} and {managerSeats, plural, one {1 additional manager seat} other {# additional manager seats}}',
  },
  confirmButtonText: {
    id: 'app.containers.admin.inviteUsersWithSeatsModal.confirmButtonText',
    defaultMessage: 'Confirm and send out invitations',
  },
});
