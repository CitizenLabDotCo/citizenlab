import { defineMessages } from 'react-intl';

export default defineMessages({
  currentAdminSeatsTitle: {
    id: 'app.components.SeatInfo.currentAdminSeatsTitle',
    defaultMessage: 'Current admin seats',
  },
  currentCollaboratorSeatsTitle: {
    id: 'app.components.SeatInfo.currentCollaboratorSeatsTitle',
    defaultMessage: 'Current collaborator seats',
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
  collaboratorInfoTextWithoutBilling: {
    id: 'app.components.SeatTrackerInfo.collaboratorInfoTextWithoutBilling',
    defaultMessage:
      "Your plan has {collaboratorSeatsIncluded}, eligible for folder managers and project managers. Once you've used all the seats, extra seats will be added under 'Additional seats'.",
  },
  collaboratorsIncludedText: {
    id: 'app.components.SeatInfo.collaboratorsIncludedText',
    defaultMessage: '{managerSeats} manager seats included',
  },
  includedAdminToolTip: {
    id: 'app.components.SeatInfo.includedAdminToolTip',
    defaultMessage:
      'This shows the number of available seats for admins included in the yearly contract.',
  },
  includedCollaboratorToolTip: {
    id: 'app.components.SeatInfo.includedCollaboratorToolTip',
    defaultMessage:
      'This shows the number of available seats for collaborators included in the yearly contract.',
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
  collaboratorSeats: {
    id: 'app.components.SeatInfo.collaboratorSeats',
    defaultMessage: 'Collaborator seats',
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
    id: 'app.components.SeatInfo.adminSeatsTooltip',
    defaultMessage:
      'Administrators are in charge of the platform and they have collaborator rights for all folders and projects. You can {visitHelpCenter} to learn more about the different roles.',
  },
  collaboratorSeatsTooltip: {
    id: 'app.components.SeatInfo.collaboratorSeatsTooltip',
    defaultMessage:
      'Collaborators are folder / project managers. They can manage an unlimited number of folders / projects. You can {visitHelpCenter} to learn more about the different roles.',
  },
  rolesSupportPage: {
    id: 'app.components.SeatInfo.rolesSupportPage',
    defaultMessage:
      'https://support.citizenlab.co/en/articles/2672884-what-are-the-different-roles-on-the-platform',
  },
  visitHelpCenter: {
    id: 'app.components.SeatInfo.visitHelpCenter',
    defaultMessage: 'visit our help center',
  },
});
