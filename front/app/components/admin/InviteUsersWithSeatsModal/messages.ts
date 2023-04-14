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
  infoMessage: {
    id: 'app.containers.admin.inviteUsersWithSeatsModal.infoMessage',
    defaultMessage:
      'You are inviting {noOfUsers, plural, one {1 user} other {# users}} with {seatType} rights. Based on how many users are included in the invitation, you may need to buy additional seats.',
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
    defaultMessage:
      'I acknowledge that the billing could be updated if the total number of {seatTypes} exceeds the allowed number of seats.',
  },
  admins: {
    id: 'app.containers.admin.inviteUsersWithSeatsModal.admins',
    defaultMessage: 'admins',
  },
  managers: {
    id: 'app.containers.admin.inviteUsersWithSeatsModal.managers',
    defaultMessage: 'managers',
  },
  acceptWarning: {
    id: 'app.containers.admin.inviteUsersWithSeatsModal.acceptWarning',
    defaultMessage: 'Accept the condition to proceed',
  },
  confirmButtonText: {
    id: 'app.containers.admin.inviteUsersWithSeatsModal.confirmButtonText',
    defaultMessage: 'Confirm and send out invitations',
  },
});
