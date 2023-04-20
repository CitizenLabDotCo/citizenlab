import { defineMessages } from 'react-intl';

export default defineMessages({
  header: {
    id: 'app.containers.Admin.Users.userBlockModal.header',
    defaultMessage: 'Block user',
  },
  subtitle: {
    id: 'app.containers.Admin.Users.userBlockModal.subtitle1',
    defaultMessage:
      "The selected user won't be able to log in to the platform for {daysBlocked}. If you wish to revert this, you can unblock them from the list of blocked users.",
  },
  daysBlocked: {
    id: 'app.containers.Admin.Users.userBlockModal.daysBlocked1',
    defaultMessage:
      '{numberOfDays, plural, one {1 day} other {{numberOfDays} days}}',
  },
  reasonLabel: {
    id: 'app.containers.Admin.Users.userBlockModal.reasonLabel',
    defaultMessage: 'Reason',
  },
  reasonLabelTooltip: {
    id: 'app.containers.Admin.Users.userBlockModal.reasonLabelTooltip',
    defaultMessage: 'This will be communicated to the blocked user.',
  },
  blockInfo: {
    id: 'app.containers.Admin.Users.userBlockModal.blockInfo1',
    defaultMessage:
      "The content of this user won't be removed through this action. Don't forget to moderate their content if needed.",
  },
  blockAction: {
    id: 'app.containers.Admin.Users.userBlockModal.blockAction',
    defaultMessage: 'Block user',
  },
  allDone: {
    id: 'app.containers.Admin.Users.userBlockModal.allDone',
    defaultMessage: 'All done',
  },
  confirmation: {
    id: 'app.containers.Admin.Users.userBlockModal.confirmation1',
    defaultMessage: '{name} is blocked until {date}.',
  },
  confirmUnblock: {
    id: 'app.containers.Admin.Users.userBlockModal.confirmUnblock1',
    defaultMessage: 'Are you sure you want to unblock {name}?',
  },
  unblockActionConfirmation: {
    id: 'app.containers.Admin.Users.userBlockModal.unblockActionConfirmation',
    defaultMessage: 'Yes, I want to unblock this user',
  },
  unblockAction: {
    id: 'app.containers.Admin.Users.userBlockModal.unblockAction',
    defaultMessage: 'Unblock',
  },
  cancel: {
    id: 'app.containers.Admin.Users.userBlockModal.cancel',
    defaultMessage: 'Cancel',
  },
  bocknigInfo: {
    id: 'app.containers.Admin.Users.userBlockModal.bocknigInfo1',
    defaultMessage:
      'This user has been blocked since {from}. The ban lasts until {to}.',
  },
  blocked: {
    id: 'app.containers.Admin.Users.userBlockModal.blocked',
    defaultMessage: 'Blocked',
  },
});
