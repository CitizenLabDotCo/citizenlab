import { defineMessages } from 'react-intl';

export default defineMessages({
  currentAdminSeats: {
    id: 'app.components.SeatInfo.currentAdminSeats',
    defaultMessage: 'Current admin seats',
  },
  includedSeats: {
    id: 'app.components.SeatInfo.includedSeats',
    defaultMessage: 'Included seats',
  },
  additionalSeats: {
    id: 'app.components.SeatInfo.additionalSeats',
    defaultMessage: 'Additional seats',
  },
  adminSeatInfoMessage: {
    id: 'app.components.SeatInfo.adminSeatInfoMessage',
    defaultMessage:
      'Your plan has {adminSeatsIncluded}, including platform admins and folder admins. Once you’ve used all the seats, you agree on us billing the additional seats according to your license.',
  },
  adminSeatsIncludedSubText: {
    id: 'app.components.SeatInfo.adminSeatsIncludedSubText',
    defaultMessage: '{adminSeats} admin seats included',
  },
  projectManagerSeatInfoMessage: {
    id: 'app.components.SeatInfo.projectManagerSeatInfoMessage',
    defaultMessage:
      'Your plan has {adminSeatsIncluded}, on top of admin seats. Once you’ve used all the seats, you agree on us billing the additional seats according to your license.',
  },
  projectManagerSeatsIncludedSubText: {
    id: 'app.components.SeatInfo.projectManagerSeatsIncludedSubText',
    defaultMessage: '{projectManagerSeats} project manager seats included',
  },
  includedSeatsToolTip: {
    id: 'app.components.SeatInfo.includedSeatsToolTip',
    defaultMessage:
      'This shows the number of available seats included in the yearly contract.',
  },
  additionalSeatsToolTip: {
    id: 'app.components.SeatInfo.additionalSeatsToolTip',
    defaultMessage:
      'This shows the number of additional seats you purchased on top of “Included seats.”',
  },
});
