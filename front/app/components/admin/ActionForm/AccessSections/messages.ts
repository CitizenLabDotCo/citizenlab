import { defineMessages } from 'react-intl';

export default defineMessages({
  confirmedEmail: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.confirmedEmail',
    defaultMessage: 'Confirmed email',
  },
  identityVerification: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.identityVerification',
    defaultMessage: 'Identity verification',
  },
  seeMethodProperties: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.seeMethodProperties',
    defaultMessage: 'See method properties',
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
