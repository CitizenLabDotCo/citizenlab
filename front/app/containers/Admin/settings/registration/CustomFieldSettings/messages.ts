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
  customFieldDeletionConfirmation2: {
    id: 'app.containers.AdminPage.SettingsPage.CustomSignupFields.customFieldDeletionConfirmation2',
    defaultMessage:
      'Are you sure you want to delete this custom field? By deleting this field, any answer that users have given will also be deleted, and it will no longer be asked in projects or proposals. ',
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
