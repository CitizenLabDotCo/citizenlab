import { defineMessages } from 'react-intl';

export default defineMessages({
  newSurvey: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.newSurveyEmptyState.newSurvey',
    defaultMessage: 'New survey',
  },
  startFromScratch: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.newSurveyEmptyState.startFromScratch',
    defaultMessage: 'Start from scratch',
  },
  startFromScratchDescription: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.newSurveyEmptyState.startFromScratchDescription',
    defaultMessage:
      'Build your input collection drag and dropping the questions on the left.',
  },
  duplicateExisting: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.newSurveyEmptyState.duplicateExisting',
    defaultMessage: 'Duplicate existing',
  },
  duplicateExistingDescription: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.newSurveyEmptyState.duplicateExistingDescription',
    defaultMessage: 'Copy a survey from another project as a starting point.',
  },
  planningInPersonEvent: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.newSurveyEmptyState.planningInPersonEvent',
    defaultMessage:
      '<b>Planning an event?</b> Use the Paper Form button above to preview, download and import scanned responses',
  },
});
