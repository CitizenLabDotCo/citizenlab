import { defineMessages } from 'react-intl';

export default defineMessages({
  registrationFields: {
    id: 'app.containers.AdminPage.SettingsPage.registrationFields',
    defaultMessage: 'Registration fields',
  },
  subtitleRegistration: {
    id: 'app.containers.AdminPage.SettingsPage.subtitleRegistration',
    defaultMessage:
      'Specify what information people are asked to provide when signing up.',
  },
  addAFieldButton: {
    id: 'app.containers.AdminPage.SettingsPage.CustomSignupFields.addAFieldButton',
    defaultMessage: 'Add field',
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
  registrationQuestionDeletionConfirmation: {
    id: 'app.containers.AdminPage.SettingsPage.CustomSignupFields.registrationQuestionDeletionConfirmation',
    defaultMessage:
      'Are you sure you want to delete this registration question? All answers that users have given to this question will be permanently deleted. This action cannot be undone.',
  },
  customFieldsTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.CustomSignupFields.customFieldsTooltip',
    defaultMessage:
      'Drag and drop the fields to determine the order in which they appear in the sign-up form.',
  },
  customFieldsSubSectionTitle: {
    id: 'app.containers.AdminPage.SettingsPage.CustomSignupFields.customFieldsSubSectionTitle',
    defaultMessage: 'Fields',
  },
});
