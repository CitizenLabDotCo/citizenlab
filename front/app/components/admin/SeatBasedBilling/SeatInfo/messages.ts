import { defineMessages } from 'react-intl';

export default defineMessages({
  adminSeats: {
    id: 'app.components.SeatInfo.adminSeats',
    defaultMessage: 'Admin seats',
  },
  managerSeats: {
    id: 'app.components.SeatInfo.managerSeats',
    defaultMessage: 'Manager seats',
  },
  remainingSeats: {
    id: 'app.components.SeatInfo.remainingSeats',
    defaultMessage: 'Remaining seats',
  },
  usedSeats: {
    id: 'app.components.SeatInfo.usedSeats',
    defaultMessage: 'Used seats',
  },
  totalSeats: {
    id: 'app.components.SeatInfo.totalSeats',
    defaultMessage: 'Total seats',
  },
  view: {
    id: 'app.components.SeatInfo.view',
    defaultMessage: 'View',
  },
  seatsWithinPlanText: {
    id: 'app.components.seatsWithinPlan.seatsWithinPlanText',
    defaultMessage: 'Seats within plan',
  },
  seatsExceededPlanText: {
    id: 'app.components.seatsWithinPlan.seatsExceededPlanText',
    defaultMessage:
      '{noOfSeatsInPlan} within plan, {noOfAdditionalSeats} additional',
  },
  totalSeatsTooltip: {
    id: 'app.components.SeatInfo.totalSeatsTooltip',
    defaultMessage:
      'This shows the summed number of seats within your plan and additional seats you have purchased.',
  },
  adminSeatsTooltip: {
    id: 'app.components.SeatInfo.adminSeatsTooltip1',
    defaultMessage:
      'Administrators are in charge of the platform and they have manager rights for all folders and projects. You can {visitHelpCenter} to learn more about the different roles.',
  },
  managerSeatsTooltip: {
    id: 'app.components.SeatInfo.managerSeatsTooltip',
    defaultMessage:
      'Folder/project managers can manage an unlimited number of folders/projects. You can {visitHelpCenter} to learn more about the different roles.',
  },
  rolesSupportPage: {
    id: 'app.components.SeatInfo.rolesSupportPage',
    defaultMessage:
      'https://support.govocal.com/en/articles/2672884-what-are-the-different-roles-on-the-platform',
  },
  visitHelpCenter: {
    id: 'app.components.SeatInfo.visitHelpCenter',
    defaultMessage: 'visit our help center',
  },
  billingWarning: {
    id: 'app.components.BillingWarning.billingWarning',
    defaultMessage:
      'Once additional seats are added, your billing will be increased. Reach out to your GovSuccess Manager to learn more about it.',
  },
});
