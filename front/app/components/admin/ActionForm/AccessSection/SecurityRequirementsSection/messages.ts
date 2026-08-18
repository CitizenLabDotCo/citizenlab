import { defineMessages } from 'react-intl';

export default defineMessages({
  securityChecks: {
    id: 'front.app.components.admin.ActionForm.AccessSections.SecurityChecksSection.securityChecks2',
    defaultMessage: 'Security requirements',
  },
  none: {
    id: 'front.app.components.admin.ActionForm.AccessSections.SecurityChecksSection.none',
    defaultMessage: 'None',
  },
  emailMethodDescription: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.emailMethodDescription3',
    defaultMessage:
      'If enabled, all users need to confirm their email. If disabled, only participants who sign up by email need to confirm their email.',
  },
  phoneMethodDescription: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.phoneMethodDescription2',
    defaultMessage: 'Participant must have a confirmed phone number.',
  },
  phoneMethodDescriptionWithSmsLogin: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.phoneMethodDescriptionWithSmsLogin',
    defaultMessage:
      'If enabled, all users need to confirm their phone number. If disabled, only participants who sign up by phone number need to confirm their phone number.',
  },
  passwordAvailableDescription: {
    id: 'front.app.components.admin.ActionForm.AccessSections.SecurityChecksSection.passwordAvailableDescription',
    defaultMessage: 'Require a password on the account.',
  },
  passwordOnlyForEmailSignupTooltip: {
    id: 'front.app.components.admin.ActionForm.AccessSections.SecurityChecksSection.passwordOnlyForEmailSignupTooltip',
    defaultMessage:
      'A password is only requested from users who sign up with email. Users who sign up another way (e.g. single sign-on) are never asked to set one.',
  },
  verificationMethodDescription: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.verificationMethodDescription2',
    defaultMessage:
      'Participant must have a verified identity (see identification methods link above).',
  },
});
