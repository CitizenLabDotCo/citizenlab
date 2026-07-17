import { defineMessages } from 'react-intl';

export default defineMessages({
  firstDecideSSO: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.firstDecideSSO',
    defaultMessage:
      'Decide whether an account is needed. Sign-in is handled by single sign-on.',
  },
  requireSSO: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.requireSSO',
    defaultMessage: 'Require single sign-on',
  },
  signInViaSSO: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.signInViaSSO',
    defaultMessage: 'Sign in via the configured SSO account.',
  },
  participantsSignInWith: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.participantsSignInWith',
    defaultMessage: 'Participants sign in with {methodName}.',
  },
});