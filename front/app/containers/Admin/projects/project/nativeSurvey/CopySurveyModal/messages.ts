import { defineMessages } from 'react-intl';

export default defineMessages({
  copySurveyTitle: {
    id: 'app.components.formBuilder.copySurveyModal.title',
    defaultMessage: 'Select a survey to duplicate',
  },
  copySurveyDescription: {
    id: 'app.components.formBuilder.copySurveyModal.description',
    defaultMessage:
      'This will copy all questions and logic without the answers.',
  },
  cancel: {
    id: 'app.components.formBuilder.copySurveyModal.cancel',
    defaultMessage: 'Cancel',
  },
  duplicate: {
    id: 'app.components.formBuilder.copySurveyModal.duplicate',
    defaultMessage: 'Duplicate',
  },
  noProject: {
    id: 'app.components.formBuilder.copySurveyModal.noProject',
    defaultMessage: 'No project',
  },
  noAppropriatePhases: {
    id: 'app.components.formBuilder.copySurveyModal.noAppropriatePhases',
    defaultMessage: 'No appropriate phases found in this project',
  },
  noProjectSelected: {
    id: 'app.components.formBuilder.copySurveyModal.noProjectSelected',
    defaultMessage: 'No project selected. Please select a project first.',
  },
  noPhaseSelected: {
    id: 'app.components.formBuilder.copySurveyModal.noPhaseSelected',
    defaultMessage: 'No phase selected. Please select a phase first.',
  },
  surveyPhase: {
    id: 'app.components.formBuilder.copySurveyModal.surveyPhase',
    defaultMessage: 'Survey phase',
  },
  surveyFormPersistedWarning: {
    id: 'app.components.formBuilder.copySurveyModal.surveyFormPersistedWarning',
    defaultMessage:
      'You have already saved changes to this survey. If you duplicate another survey, the changes will be lost.',
  },
});
