import { defineMessages } from 'react-intl';

export default defineMessages({
  demographicQuestion: {
    id: 'app.containers.AdminPage.SettingsPage.demographicQuestions',
    defaultMessage: 'Demographic questions',
  },
  subtitleRegistration: {
    id: 'app.containers.AdminPage.SettingsPage.subtitleRegistration',
    defaultMessage:
      'Specify what information people are asked to provide when signing up.',
  },
  addAQuestionButton: {
    id: 'app.containers.AdminPage.SettingsPage.CustomSignupFields.addAQuestionButton',
    defaultMessage: 'Add question',
  },
  domicileManagementInfo: {
    id: 'app.containers.AdminPage.SettingsPage.CustomSignupFields.domicileManagementInfo',
    defaultMessage:
      'Answer options for place of residence can be set in the {geographicAreasTabLink}.',
  },
  geographicAreasTabLinkText: {
    id: 'app.containers.AdminPage.SettingsPage.CustomSignupFields.geographicAreasTabLinkText',
    defaultMessage: 'Geographic areas tab',
  },
  demographicQuestionDeletionConfirmation: {
    id: 'app.containers.AdminPage.SettingsPage.CustomSignupFields.demographicQuestionDeletionConfirmation3',
    defaultMessage:
      'Are you sure you want to delete this demographic question? All answers that users have given to this question will be permanently deleted, and it will no longer be asked in projects or proposals. This action cannot be undone.',
  },
  demographicQuestionsTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.CustomSignupFields.demographicQuestionsTooltip',
    defaultMessage:
      'Drag and drop the questions to determine the order in which they appear in the global sign-up process.',
  },
  demographicQuestionsSubSectionTitle: {
    id: 'app.containers.AdminPage.SettingsPage.CustomSignupFields.demographicQuestionsSubSectionTitle',
    defaultMessage: 'Questions',
  },
});
