import { defineMessages } from 'react-intl';

export default defineMessages({
  nQuestions: {
    id: 'app.components.admin.ActionForm.nQuestions',
    defaultMessage:
      '{nQuestions, plural, one {1 question} other {{nQuestions} questions}}',
  },
  adminsManagersOnly: {
    id: 'app.components.admin.ActionForm.adminsManagersOnly',
    defaultMessage: 'Admins & managers only',
  },
  anyoneCanParticipate: {
    id: 'app.components.admin.ActionForm.anyoneCanParticipate',
    defaultMessage: 'Anyone can participate',
  },
  signInRequired: {
    id: 'app.components.admin.ActionForm.signInRequired',
    defaultMessage: 'Sign-in required',
  },
  nGroups: {
    id: 'app.components.admin.ActionForm.nGroups',
    defaultMessage: '{nGroups, plural, one {1 group} other {{nGroups} groups}}',
  },
  name: {
    id: 'app.components.admin.ActionForm.name',
    defaultMessage: 'Name',
  },
  requireUserToSetAPassword: {
    id: 'app.components.admin.ActionForm.requireUserToSetAPassword',
    defaultMessage: 'Require user to set a password',
  },
  password: {
    id: 'app.components.admin.ActionForm.password3',
    defaultMessage: 'Password',
  },
  anonymous: {
    id: 'app.components.admin.ActionForm.anonymous',
    defaultMessage: 'Anonymous',
  },
  piiExcluded: {
    id: 'app.components.admin.ActionForm.piiExcluded',
    defaultMessage: 'PII excluded',
  },
  requireConfirmedEmail: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.requireConfirmedEmail',
    defaultMessage: 'Require confirmed email from all participants',
  },
  requireConfirmedPhoneNumber: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.requireConfirmedPhoneNumber',
    defaultMessage: 'Require confirmed phone number from all participants',
  },
  requireIdentityVerification: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.requireIdentityVerification',
    defaultMessage: 'Require identity verification from all participants',
  },
  // Short forms of the three security requirements above, for the summary chips
  // and the collapsed section summary, where the full sentences don't fit.
  confirmedEmail: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.confirmedEmail',
    defaultMessage: 'Confirmed email',
  },
  confirmedPhone: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.confirmedPhone',
    defaultMessage: 'Confirmed phone',
  },
  verification: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.verification',
    defaultMessage: 'Verification',
  },
  usingPlatformDefaults: {
    id: 'app.components.admin.ActionForm.usingPlatformDefaults',
    defaultMessage: 'Using <link>platform defaults</link>',
  },
  override: {
    id: 'app.components.admin.ActionForm.override',
    defaultMessage: 'Override',
  },
  revertToPlatformDefaults: {
    id: 'app.components.admin.ActionForm.revertToPlatformDefaults',
    defaultMessage: 'Revert to platform defaults',
  },
  revertToPlatformDefaultsConfirmation: {
    id: 'app.components.admin.ActionForm.revertToPlatformDefaultsConfirmation',
    defaultMessage: 'Revert to platform defaults?',
  },
  revertToPlatformDefaultsInfo: {
    id: 'app.components.admin.ActionForm.revertToPlatformDefaultsInfo2',
    defaultMessage:
      'This action will follow the platform defaults again. The settings you chose for it — including which groups and demographic questions apply — will be discarded.',
  },
  revertToPlatformDefaultsConfirmButton: {
    id: 'app.components.admin.ActionForm.revertToPlatformDefaultsConfirmButton',
    defaultMessage: 'Revert',
  },
  revertToPlatformDefaultsCancelButton: {
    id: 'app.components.admin.ActionForm.revertToPlatformDefaultsCancelButton',
    defaultMessage: 'Cancel',
  },
});
