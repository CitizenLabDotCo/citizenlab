import { defineMessages } from 'react-intl';

export default defineMessages({
  whoCanParticipate: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.whoCanParticipate',
    defaultMessage: 'Who can participate',
  },
  requireSignIn: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.requireSignIn',
    defaultMessage: 'Require sign-in',
  },
  signInWith: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.signInWith',
    defaultMessage: 'Participants sign in with {methods}.',
  },
  email: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.email',
    defaultMessage: 'email',
  },
  sms: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.sms',
    defaultMessage: 'SMS',
  },
  ssoSeeBelow: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.ssoSeeBelow2',
    defaultMessage: 'SSO (see identification methods link below)',
  },
  noSignInMethodEnabled: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.noSignInMethodEnabled',
    defaultMessage: 'No sign-in method is enabled on this platform.',
  },
  confirmedEmail: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.confirmedEmail',
    defaultMessage: 'Confirmed email',
  },
  confirmedPhoneNumber: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.confirmedPhoneNumber',
    defaultMessage: 'Confirmed phone number',
  },
  identityVerification: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.identityVerification',
    defaultMessage: 'Identity verification',
  },
  emailMethodDescription: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.emailMethodDescription2',
    defaultMessage: 'Participant must have a confirmed email address.',
  },
  verificationMethodDescription: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.verificationMethodDescription2',
    defaultMessage:
      'Participant must have a verified identity (see identification methods link above).',
  },
  phoneMethodDescription: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.phoneMethodDescription2',
    defaultMessage: 'Participant must have a confirmed phone number.',
  },
});
