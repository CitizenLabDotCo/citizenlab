import { defineMessages } from 'react-intl';

export default defineMessages({
  setAsAdmin: {
    id: 'app.containers.Admin.Users.setAsAdmin',
    defaultMessage: 'Set as admin',
  },
  setAsNormalUser: {
    id: 'app.containers.Admin.Users.setAsNormalUser',
    defaultMessage: 'Set as normal user',
  },
  confirm: {
    id: 'app.containers.Admin.Users.confirm',
    defaultMessage: 'Confirm',
  },
  giveAdminRights: {
    id: 'app.containers.Admin.Users.giveAdminRights',
    defaultMessage: 'Give admin rights',
  },
  confirmNormalUserQuestion: {
    id: 'app.containers.Admin.Users.confirmNormalUserQuestion',
    defaultMessage: 'Are you sure you want to set {name} as a normal user?',
  },
  confirmAdminQuestion: {
    id: 'app.containers.Admin.Users.confirmAdminQuestion',
    defaultMessage:
      'Are you sure you want to give {name} platform admin rights?',
  },
  buyOneAditionalSeat: {
    id: 'app.containers.Admin.Users.buyOneAditionalSeat',
    defaultMessage: 'Buy one additional seat',
  },
  confirmSetManagerAsNormalUserQuestion: {
    id: 'app.containers.Admin.Users.confirmSetManagerAsNormalUserQuestion',
    defaultMessage:
      'Are you sure you want to set {name} as a normal user? Please note that they will lose manager rights to all the projects and folders that they are assigned to on confirmation.',
  },
  reachedLimitMessage: {
    id: 'app.containers.Admin.Users.reachedLimitMessage',
    defaultMessage:
      'You have reached the limit of seats within your plan, 1 additional seat for {name} will be added.',
  },
});
