import { defineMessages } from 'react-intl';

export default defineMessages({
  unavailablePasswordLogin: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.unavailablePasswordLogin',
    defaultMessage:
      'Unavailable: password login is turned off for this platform.',
  },
  unavailableVerification: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.unavailableVerification',
    defaultMessage:
      'Unavailable: no identity verification method is configured.',
  },
  whoCanParticipate: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.whoCanParticipate',
    defaultMessage: 'Who can participate',
  },
  firstDecide: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.firstDecide',
    defaultMessage:
      'First decide whether an account is needed at all, then pick the proof of identity required.',
  },
  requireSignIn: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.requireSignIn',
    defaultMessage: 'Require sign-in',
  },
  mustProveIdentity: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.mustProveIdentity',
    defaultMessage: 'Must prove who they are first.',
  },
  pickAtLeastOne: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.pickAtLeastOne',
    defaultMessage: 'Pick at least one method, otherwise participants have no way to prove who they are.',
  },
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
  seeWhichFieldsThisReturns: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.seeWhichFieldsThisReturns',
    defaultMessage: 'See which fields this returns',
  },
  confirmedEmail: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.confirmedEmail',
    defaultMessage: 'Confirmed email',
  },
  identityVerification: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.identityVerification',
    defaultMessage: 'Identity verification',
  },
  atLeastOneMethodMustStayEnabled: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.atLeastOneMethodMustStayEnabled',
    defaultMessage:
      'At least one authentication method must stay enabled, so this one can’t be turned off.',
  },
  emailMethodDescription: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.emailMethodDescription',
    defaultMessage:
      'Participant confirms an email address with a one-time code.',
  },
  verificationMethodDescription: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.verificationMethodDescription',
    defaultMessage:
      'Participant proves their identity through an external register.',
  },
});
