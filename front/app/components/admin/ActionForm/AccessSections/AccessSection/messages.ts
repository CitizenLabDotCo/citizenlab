import { defineMessages } from 'react-intl';

export default defineMessages({
  whoCanParticipate: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.whoCanParticipate',
    defaultMessage: 'Who can participate',
  },
  firstDecide: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.firstDecide',
    defaultMessage:
      'First decide whether an account is needed at all. Signing in and the security checks below are separate: participants can sign in by email, SMS or SSO without any check being required.',
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
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.ssoSeeBelow',
    defaultMessage: 'SSO (see below)',
  },
  noSignInMethodEnabled: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.noSignInMethodEnabled',
    defaultMessage: 'No sign-in method is enabled on this platform.',
  },
});
