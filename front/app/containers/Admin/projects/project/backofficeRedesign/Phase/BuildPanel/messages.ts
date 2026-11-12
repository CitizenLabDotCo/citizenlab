import { defineMessages } from 'react-intl';

export default defineMessages({
  switchLockedResponses: {
    id: 'app.containers.Admin.projects.project.switchLockedResponses',
    defaultMessage:
      'This phase already has responses, so the kind of survey can no longer change.',
  },
  switchLockedPollQuestions: {
    id: 'app.containers.Admin.projects.project.switchLockedPollQuestions',
    defaultMessage:
      'This poll already has questions. Delete them first to use another kind of survey.',
  },
  switchSurveyMethodTitle: {
    id: 'app.containers.Admin.projects.project.switchSurveyMethodTitle',
    defaultMessage: 'Change the kind of survey?',
  },
  switchSurveyMethodIntro: {
    id: 'app.containers.Admin.projects.project.switchSurveyMethodIntro',
    defaultMessage:
      'The phase stays, but some of its setup does not carry over:',
  },
  switchLosesAccessSettings: {
    id: 'app.containers.Admin.projects.project.switchLosesAccessSettings',
    defaultMessage:
      'Access settings you changed for taking part in this phase are removed. The new kind of survey starts from the platform defaults.',
  },
  switchHidesSurveyForm: {
    id: 'app.containers.Admin.projects.project.switchHidesSurveyForm',
    defaultMessage:
      'The survey questions are hidden. They come back if you switch back to a survey.',
  },
  switchClearsEmbedUrl: {
    id: 'app.containers.Admin.projects.project.switchClearsEmbedUrl',
    defaultMessage: 'The external survey link is removed.',
  },
  switchChangesNotifications: {
    id: 'app.containers.Admin.projects.project.switchChangesNotifications',
    defaultMessage:
      'Notifications, insights and reports follow the new kind of survey.',
  },
  switchCancel: {
    id: 'app.containers.Admin.projects.project.switchCancel',
    defaultMessage: 'Cancel',
  },
  switchConfirm: {
    id: 'app.containers.Admin.projects.project.switchConfirm',
    defaultMessage: 'Change',
  },
  savingAndOpening: {
    id: 'app.containers.Admin.projects.project.savingAndOpeningSurvey',
    defaultMessage: 'Saving the phase and opening your selection…',
  },
  waitingForAttachment: {
    id: 'app.containers.Admin.projects.project.waitingForSurveyAttachment',
    defaultMessage:
      'Wait for the attachment to finish uploading before continuing.',
  },
  surveySetupLead: {
    id: 'app.containers.Admin.projects.project.surveySetupLead',
    defaultMessage:
      'Build the survey, or bring in responses you collected offline.',
  },
  startFromScratch: {
    id: 'app.containers.Admin.projects.project.startFromScratch',
    defaultMessage: 'Start from scratch',
  },
  usePreviousSurvey: {
    id: 'app.containers.Admin.projects.project.usePreviousSurvey',
    defaultMessage: 'Use a previous survey',
  },
  usePreviousSurveyTooltip: {
    id: 'app.containers.Admin.projects.project.usePreviousSurveyTooltip',
    defaultMessage: 'Reuse the questions from a survey you ran before',
  },
  importResponses: {
    id: 'app.containers.Admin.projects.project.importResponses',
    defaultMessage: 'Import responses you already have',
  },
});
