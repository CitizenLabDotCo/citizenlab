import { defineMessages } from 'react-intl';

export default defineMessages({
  demographicQuestion: {
    id: 'app.containers.AdminPage.SettingsPage.demographicQuestions',
    defaultMessage: 'Demographic questions',
  },
  subtitleRegistration1: {
    id: 'app.containers.AdminPage.SettingsPage.subtitleRegistration1',
    defaultMessage:
      'Manage the demographic questions used on this platform. Enabling a question here will do two things:',
  },
  subtitleBullet1: {
    id: 'app.containers.AdminPage.SettingsPage.subtitleBullet1',
    defaultMessage:
      'The question will be asked in the global sign-up process (e.g. when people click "Sign up" on the homepage).',
  },
  subtitleBullet2: {
    id: 'app.containers.AdminPage.SettingsPage.subtitleBullet3',
    defaultMessage:
      'The question will be asked <b>by default</b> when people want to engage with a project or sign up for an event. Depending on your license, however, <b>admins and project managers can override this per phase</b>- see the “Phase access and user data” tab on each project phase.',
  },
  subtitleRegistration2: {
    id: 'app.containers.AdminPage.SettingsPage.subtitleRegistration2',
    defaultMessage:
      'The same applies to the "required" setting that you see when you click "Edit" on a question.',
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
