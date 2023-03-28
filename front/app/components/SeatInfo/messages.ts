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
  adminInfoTextWithBilling: {
    id: 'app.components.SeatInfo.adminInfoTextWithBilling',
    defaultMessage:
      "Your plan has {adminSeatsIncluded}. Once you've used all the seats, you agree on us billing the additional seats according to your license.",
  },
  adminInfoTextWithoutBilling: {
    id: 'app.components.SeatTrackerInfo.adminInfoTextWithoutBilling',
    defaultMessage:
      "Your plan has {adminSeatsIncluded}. Once you’ve used all the seats, extra seats will be added under 'Additional seats'.",
  },
  adminSeatsIncludedText: {
    id: 'app.components.SeatInfo.adminSeatsIncludedText',
    defaultMessage: '{adminSeats} admin seats included',
  },
  collaboratorInfoTextWithBilling: {
    id: 'app.components.SeatInfo.collaboratorInfoTextWithBilling',
    defaultMessage:
      "Your plan has {collaboratorSeatsIncluded}, eligible for folder managers and project managers. Once you've used all the seats, you agree on us billing the additional seats according to your license.",
  },
  collaboratorInfoTextWithoutBilling: {
    id: 'app.components.SeatTrackerInfo.collaboratorInfoTextWithoutBilling2',
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
});
