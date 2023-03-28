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
  adminMessageWithBilling: {
    id: 'app.components.SeatInfo.adminMessageWithBilling',
    defaultMessage:
      "Your plan has {adminSeatsIncluded}. Once you've used all the seats, you agree on us billing the additional seats according to your license.",
  },
  adminMessageWithoutBilling: {
    id: 'app.components.SeatTrackerInfo.adminMessageWithoutBilling',
    defaultMessage:
      "Your plan has {adminSeatsIncluded}. Once you’ve used all the seats, extra seats will be added under 'Additional seats'.",
  },
  adminSeatsIncludedSubText: {
    id: 'app.components.SeatInfo.adminSeatsIncludedSubText',
    defaultMessage: '{adminSeats} admin seats included',
  },
  collaboratorMessageWithBilling: {
    id: 'app.components.SeatInfo.collaboratorMessage',
    defaultMessage:
      "Your plan has {adminSeatsIncluded}, eligible for folder managers and project managers. Once you've used all the seats, you agree on us billing the additional seats according to your license.",
  },
  collaboratorMessageWithoutBilling: {
    id: 'app.components.SeatTrackerInfo.collaboratorMessageWithoutBilling',
    defaultMessage:
      "Your plan has {adminSeatsIncluded}, eligible for folder managers and project managers. Once you’ve used all the seats, extra seats will be added under 'Additional seats'.",
  },
  collaboratorsIncludedSubText: {
    id: 'app.components.SeatInfo.collaboratorsIncludedSubText',
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
});
