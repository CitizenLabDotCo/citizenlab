import { defineMessages } from 'react-intl';

export default defineMessages({
  allDone: {
    id: 'app.components.admin.seatSetSuccess.allDone',
    defaultMessage: 'All done',
  },
  rightsGranted: {
    id: 'app.components.admin.seatSetSuccess.rightsGranted',
    defaultMessage:
      '{seatType} rights have been granted to the selected user(s).',
  },
  admin: {
    id: 'app.components.admin.seatSetSuccess.admin',
    defaultMessage: 'Admin',
  },
  moderator: {
    id: 'app.components.admin.seatSetSuccess.collaborator',
    defaultMessage: 'Collaborator',
  },
  close: {
    id: 'app.components.admin.seatSetSuccess.close',
    defaultMessage: 'Close',
  },
  orderCompleted: {
    id: 'app.components.admin.seatSetSuccess.orderCompleted',
    defaultMessage: 'Order completed',
  },
  reflectedMessage: {
    id: 'app.components.admin.seatSetSuccess.reflectedMessage',
    defaultMessage:
      'The changes on your plan will be reflected on your next billing cycle.',
  },
});
