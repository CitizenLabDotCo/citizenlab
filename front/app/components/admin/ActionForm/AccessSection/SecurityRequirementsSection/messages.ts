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
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.emailMethodDescription2',
    defaultMessage: 'Users must have a confirmed email address.',
  },
  emailMethodDescriptionWithPasswordLogin: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.emailMethodDescriptionWithPasswordLogin',
    defaultMessage:
      'If enabled, all users need to confirm their email. If disabled, only users who sign up by email need to confirm their email.',
  },
  phoneMethodDescription: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.phoneMethodDescription3',
    defaultMessage: 'Users must have a confirmed phone number.',
  },
  phoneMethodDescriptionWithSmsLogin: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.phoneMethodDescriptionWithSmsLogin2',
    defaultMessage:
      'If enabled, all users need to confirm their phone number. If disabled, only users who sign up by phone number need to confirm their phone number.',
  },
  passwordAvailableDescription: {
    id: 'front.app.components.admin.ActionForm.AccessSections.SecurityChecksSection.passwordAvailableDescription2',
    defaultMessage:
      "If enabled, users must set a password before participating. If disabled, users won't be asked to set a password.",
  },
  passwordOnlyForEmailSignupTooltip: {
    id: 'front.app.components.admin.ActionForm.AccessSections.SecurityChecksSection.passwordOnlyForEmailSignupTooltip2',
    defaultMessage:
      'If enabled, a password is only requested from users who sign up with email. Users who sign up with SSO are never asked to set one.',
  },
  passwordOnlyForEmailOrSMSLoginTooltip: {
    id: 'front.app.components.admin.ActionForm.AccessSections.SecurityChecksSection.passwordOnlyForEmailOrSMSLoginTooltip',
    defaultMessage:
      'If enabled, a password is only requested from users who sign up with email or SMS. Users who sign up with SSO are never asked to set one.',
  },
  verificationMethodDescription: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.verificationMethodDescription2',
    defaultMessage:
      'Users must have a verified identity (see identification methods link above).',
  },
});
