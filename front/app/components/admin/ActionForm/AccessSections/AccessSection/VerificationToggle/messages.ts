import { defineMessages } from 'react-intl';

export default defineMessages({
  thisMustStayEnabled: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.thisMustStayEnabled',
    defaultMessage:
      'If nothing is required for email or phone, this method must stay enabled. If you want to disable Identity verification, first choose a different option under "Email and phone requirements".',
  },
  verificationMethodDescription: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.verificationMethodDescription',
    defaultMessage:
      'Participant proves their identity through an external register.',
  },
  unavailableVerification: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.unavailableVerification',
    defaultMessage:
      'Unavailable: no identity verification method is configured.',
  },
});
