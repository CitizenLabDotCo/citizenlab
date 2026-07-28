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
  passwordOnlyForEmailSignupTooltip: {
    id: 'app.components.admin.ActionForm.DataSection.PersonalInfoSection.passwordOnlyForEmailSignupTooltip',
    defaultMessage:
      'A password is only requested from users who sign up with email. Users who sign up another way (e.g. single sign-on) are never asked to set one.',
  },
});
