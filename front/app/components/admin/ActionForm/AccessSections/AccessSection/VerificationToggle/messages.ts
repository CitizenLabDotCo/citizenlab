import { defineMessages } from 'react-intl';

export default defineMessages({
  atLeastOneMethodMustStayEnabled: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.atLeastOneMethodMustStayEnabled',
    defaultMessage:
      'At least one authentication method must stay enabled, so this one can’t be turned off.',
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
