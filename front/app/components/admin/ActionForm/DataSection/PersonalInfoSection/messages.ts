import { defineMessages } from 'react-intl';

export default defineMessages({
  personalInfo: {
    id: 'app.components.admin.ActionForm.DataSection.PersonalInfoSection.personalInfo',
    defaultMessage: 'Personal info',
  },
  fullName: {
    id: 'app.components.admin.ActionForm.DataSection.PersonalInfoSection.fullName',
    defaultMessage: 'Full name',
  },
  fullNameDescription: {
    id: 'app.components.admin.ActionForm.DataSection.PersonalInfoSection.fullNameDescription',
    defaultMessage: 'Ask for first and last name.',
  },
  password: {
    id: 'app.components.admin.ActionForm.DataSection.PersonalInfoSection.password',
    defaultMessage: 'Password',
  },
  passwordAvailableDescription: {
    id: 'app.components.admin.ActionForm.DataSection.PersonalInfoSection.passwordAvailableDescription',
    defaultMessage: 'Require a password on the account.',
  },
  passwordUnavailableDescription: {
    id: 'app.components.admin.ActionForm.DataSection.PersonalInfoSection.passwordUnavailableDescription',
    defaultMessage:
      'Requires the “Confirmed email” method to be enabled.',
  },
});
