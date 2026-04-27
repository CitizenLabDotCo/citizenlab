import { defineMessages } from 'react-intl';

export default defineMessages({
  billingWarning: {
    id: 'app.components.BillingWarning.billingWarning',
    defaultMessage:
      'Once additional seats are added, your billing will be increased. Reach out to your GovSuccess Manager to learn more about it.',
  },
  totalAdminSeats: {
    id: 'app.components.SeatInfo.totalAdminSeats',
    defaultMessage: 'Total admin seats ({totalSeats})',
  },
  totalManagerSeats: {
    id: 'app.components.SeatInfo.totalManagerSeats',
    defaultMessage: 'Total manager seats ({totalSeats})',
  },
  assignedSeats: {
    id: 'app.components.SeatInfo.assignedSeats',
    defaultMessage: 'Assigned seats: {assignedSeats}',
  },
  availableSeats: {
    id: 'app.components.SeatInfo.availableSeats',
    defaultMessage: 'Available seats: {availableSeats}',
  },
  goToSeatsOverview: {
    id: 'app.components.SeatInfo.goToSeatsOverview',
    defaultMessage: 'Go to seats overview',
  },
});
