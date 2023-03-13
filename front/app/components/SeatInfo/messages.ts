import { defineMessages } from 'react-intl';

export default defineMessages({
  currentAdminSeatsTitle: {
    id: 'app.components.SeatInfo.currentAdminSeatsTitle',
    defaultMessage: 'Current admin seats',
  },
  currentProjectManagerSeatsTitle: {
    id: 'app.components.SeatInfo.currentProjectManagerSeats',
    defaultMessage: 'Current project manager seats',
  },
  includedSeats: {
    id: 'app.components.SeatInfo.includedSeats',
    defaultMessage: 'Included seats',
  },
  additionalSeats: {
    id: 'app.components.SeatInfo.additionalSeats',
    defaultMessage: 'Additional seats',
  },
  adminInfoMessage: {
    id: 'app.components.SeatInfo.adminInfoMessage',
    defaultMessage:
      "Your plan has {adminSeatsIncluded}, including platform admins and folder managers. Once you’ve used all the seats, seats will be added under 'Additional seats'.",
  },
  adminSeatsIncludedSubText: {
    id: 'app.components.SeatInfo.adminSeatsIncludedSubText',
    defaultMessage: '{adminSeats} admin seats included',
  },
  projectManagerInfoMessage: {
    id: 'app.components.SeatInfo.projectManagerInfoMessage',
    defaultMessage:
      "Your plan has {adminSeatsIncluded}, on top of admin seats. Once you’ve used all the seats, seats will be added under 'Additional seats'.",
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
});
