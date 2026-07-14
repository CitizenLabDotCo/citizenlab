import { defineMessages } from 'react-intl';

export default defineMessages({
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
  seeWhichFieldsThisReturns: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.seeWhichFieldsThisReturns',
    defaultMessage: 'See which fields this returns',
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
  phoneMethodDescription: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.phoneMethodDescription',
    defaultMessage:
      'Participant confirms a phone number with a one-time code sent by SMS.',
  },
});
