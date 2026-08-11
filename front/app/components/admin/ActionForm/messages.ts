import { defineMessages } from 'react-intl';

export default defineMessages({
  resetDemographicQuestionsAndGroups: {
    id: 'app.components.admin.ActionForm.resetDemographicQuestionsAndGroups',
    defaultMessage: 'Reset demographic questions and groups',
  },
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
  password: {
    id: 'app.components.admin.ActionForm.password',
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
});
