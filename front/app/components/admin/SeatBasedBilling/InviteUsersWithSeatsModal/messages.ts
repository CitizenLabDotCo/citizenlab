import { defineMessages } from 'react-intl';

export default defineMessages({
  confirmSeatUsageChange: {
    id: 'app.containers.admin.inviteUsersWithSeatsModal.confirmSeatUsageChange',
    defaultMessage: 'Confirm impact on seat usage',
  },
  infoMessage: {
    id: 'app.containers.admin.inviteUsersWithSeatsModal.infoMessage2',
    defaultMessage:
      'You have reached the limit of available seats within your plan.',
  },
  additionalAdminSeats: {
    id: 'app.containers.admin.inviteUsersWithSeatsModal.additionalAdminSeats1',
    defaultMessage:
      '{seats, plural, one {1 additional admin seat will be added over the limit} other {# additional admin seats will be added over the limit}}.',
  },
  additionalManagerSeats: {
    id: 'app.containers.admin.inviteUsersWithSeatsModal.additionalManagerSeats1',
    defaultMessage:
      '{seats, plural, one {1 additional manager seat will be added over the limit} other {# additional manager seats will be added over the limit}}.',
  },
  additionalAdminAndManagerSeats: {
    id: 'app.containers.admin.inviteUsersWithSeatsModal.additionalAdminAndManagerSeats1',
    defaultMessage:
      '{adminSeats, plural, one {1 additional admin seat} other {# additional admin seats}} and {managerSeats, plural, one {1 additional manager seat} other {# additional manager seats}} will be added over the limit.',
  },
  confirmButtonText: {
    id: 'app.containers.admin.inviteUsersWithSeatsModal.confirmButtonText',
    defaultMessage: 'Confirm and send out invitations',
  },
});
