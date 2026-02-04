import { defineMessages } from 'react-intl';

export default defineMessages({
  currentAdminSeatsTitle: {
    id: 'app.components.SeatInfo.currentAdminSeatsTitle',
    defaultMessage: 'Current admin seats',
  },
  currentManagerSeatsTitle: {
    id: 'app.components.SeatInfo.currentManagerSeatsTitle',
    defaultMessage: 'Current manager seats',
  },
  includedSeats: {
    id: 'app.components.SeatInfo.includedSeats',
    defaultMessage: 'Included seats',
  },
  additionalSeats: {
    id: 'app.components.SeatInfo.additionalSeats',
    defaultMessage: 'Additional seats',
  },
  adminInfoTextWithoutBilling: {
    id: 'app.components.SeatTrackerInfo.adminInfoTextWithoutBilling',
    defaultMessage:
      "Your plan has {adminSeatsIncluded}. Once you've used all the seats, extra seats will be added under 'Additional seats'.",
  },
  adminSeatsIncludedText: {
    id: 'app.components.SeatInfo.adminSeatsIncludedText',
    defaultMessage: '{adminSeats} admin seats included',
  },
  managerInfoTextWithoutBilling: {
    id: 'app.components.SeatTrackerInfo.managerInfoTextWithoutBilling',
    defaultMessage:
      "Your plan has {managerSeatsIncluded}, eligible for folder managers and project managers. Once you've used all the seats, extra seats will be added under 'Additional seats'.",
  },
  managersIncludedText: {
    id: 'app.components.SeatInfo.managersIncludedText',
    defaultMessage: '{managerSeats} manager seats included',
  },
  includedAdminToolTip: {
    id: 'app.components.SeatInfo.includedAdminToolTip',
    defaultMessage:
      'This shows the number of available seats for admins included in the yearly contract.',
  },
  includedManagerToolTip: {
    id: 'app.components.SeatInfo.includedManagerToolTip',
    defaultMessage:
      'This shows the number of available seats for managers included in the yearly contract.',
  },
  additionalSeatsToolTip: {
    id: 'app.components.SeatInfo.additionalSeatsToolTip',
    defaultMessage:
      "This shows the number of additional seats you have purchased on top of 'Included seats'.",
  },
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
  rolesSupportPage2: {
    id: 'app.components.SeatInfo.rolesSupportPage2',
    defaultMessage:
      'https://support.govocal.com/en/articles/527642-what-are-the-different-roles-on-the-platform',
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
