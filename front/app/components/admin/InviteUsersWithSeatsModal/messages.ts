import { defineMessages } from 'react-intl';

export default defineMessages({
  giveManagerRights: {
    id: 'app.containers.admin.inviteUsersWithSeatsModal.giveManagerRights',
    defaultMessage: 'Give manager rights',
  },
  giveAdminRights: {
    id: 'app.containers.admin.inviteUsersWithSeatsModal.giveAdminRights',
    defaultMessage: 'Give admin rights',
  },
  confirmSeatUsageChange: {
    id: 'app.containers.admin.inviteUsersWithSeatsModal.confirmSeatUsageChange',
    defaultMessage: 'Confirm impact on seat usage',
  },
  infoMessage: {
    id: 'app.containers.admin.inviteUsersWithSeatsModal.infoMessage1',
    defaultMessage:
      'You have reached the limit of available seats within your plan. {additionalSeats} will be added over the limit.',
  },
  admin: {
    id: 'app.containers.admin.inviteUsersWithSeatsModal.admin',
    defaultMessage: 'admin',
  },
  manager: {
    id: 'app.containers.admin.inviteUsersWithSeatsModal.manager',
    defaultMessage: 'manager',
  },
  billingAcknowledgement: {
    id: 'app.containers.admin.inviteUsersWithSeatsModal.billingAcknowledgement',
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
  managers: {
    id: 'app.containers.admin.inviteUsersWithSeatsModal.managers',
    defaultMessage: 'managers',
  },
  acceptWarning: {
    id: 'app.containers.admin.inviteUsersWithSeatsModal.acceptWarning',
    defaultMessage: 'Accept the condition to proceed',
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
