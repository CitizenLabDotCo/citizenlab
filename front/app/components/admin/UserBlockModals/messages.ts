import { defineMessages } from 'react-intl';

export default defineMessages({
  header: {
    id: 'app.containers.Admin.Users.userBlockModal.header',
    defaultMessage: 'Block user',
  },
  subtitle: {
    id: 'app.containers.Admin.Users.userBlockModal.subtitle',
    defaultMessage:
      'The selected user won’t be able to login to the platform for {ninetyDays}. If you wish to revert this, you can unblock them from the list of blocked users.',
  },
  ninetyDays: {
    id: 'app.containers.Admin.Users.userBlockModal.ninetyDays',
    defaultMessage: '90 days',
  },
  reasonLabel: {
    id: 'app.containers.Admin.Users.userBlockModal.reasonLabel',
    defaultMessage: 'Reason',
  },
  reasonLabelTooltip: {
    id: 'app.containers.Admin.Users.userBlockModal.reasonLabelTooltip',
    defaultMessage: 'This will be comunicated to the blocked user.',
  },
  blockInfo: {
    id: 'app.containers.Admin.Users.userBlockModal.blockInfo',
    defaultMessage:
      'The content of this user won’t be removed through this action. Don’t forget to moderate their content if needed.',
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
    id: 'app.containers.Admin.Users.userBlockModal.confirmation',
    defaultMessage: '{name} is blocked until {date}.',
  },
  confirmUnblock: {
    id: 'app.containers.Admin.Users.userBlockModal.confirmUnblock',
    defaultMessage: 'Are you sure you want to unblock the user?',
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
    id: 'app.containers.Admin.Users.userBlockModal.bocknigInfo',
    defaultMessage: 'This user has been blocked since {from}, until {to}.',
  },
  blocked: {
    id: 'app.containers.Admin.Users.userBlockModal.blocked',
    defaultMessage: 'Blocked',
  },
});
