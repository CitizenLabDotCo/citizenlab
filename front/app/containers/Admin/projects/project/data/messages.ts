import { defineMessages } from 'react-intl';

export default defineMessages({
  dataTitle: {
    id: 'app.containers.AdminPage.Project.data.title',
    defaultMessage: 'Clear all participation data from this project',
  },
  dataDescription: {
    id: 'app.containers.AdminPage.Project.data.descriptionText',
    defaultMessage:
      'Clear ideas, comments, votes, reactions, survey responses, poll responses, volunteers and event attendees. In the case of voting phases, this action will clear the votes but not the options.',
  },
  dataWarning: {
    id: 'app.containers.AdminPage.Project.data.warningMessage',
    defaultMessage: 'This action cannot be undone.',
  },
  resetParticipationData: {
    id: 'app.containers.AdminPage.Project.resetParticipationData',
    defaultMessage: 'Reset all participation data',
  },
  confirmationTitle: {
    id: 'app.containers.AdminPage.Project.confirmation.title',
    defaultMessage: 'Are you sure you want to reset all participation data?',
  },
  confirmationDescription: {
    id: 'app.containers.AdminPage.Project.confirmation.description',
    defaultMessage: 'This action cannot be undone.',
  },
  confirmationYes: {
    id: 'app.containers.AdminPage.Project.confirmation.yes',
    defaultMessage: 'Reset all participation data',
  },
  confirmationNo: {
    id: 'app.containers.AdminPage.Project.confirmation.no',
    defaultMessage: 'Cancel',
  },
});
