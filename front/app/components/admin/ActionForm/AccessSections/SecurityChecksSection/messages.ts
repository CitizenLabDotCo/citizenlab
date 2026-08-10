import { defineMessages } from 'react-intl';

export default defineMessages({
  securityChecks: {
    id: 'front.app.components.admin.ActionForm.AccessSections.SecurityChecksSection.securityChecks2',
    defaultMessage: 'Security requirements',
  },
  none: {
    id: 'front.app.components.admin.ActionForm.AccessSections.SecurityChecksSection.none',
    defaultMessage: 'None',
  },
  // Keeps its pre-move id on purpose: the copy is unchanged and already
  // translated, so re-prefixing it would orphan those translations.
  unavailableVerification: {
    id: 'front.app.components.admin.ActionForm.AccessSections.AccessSection.unavailableVerification',
    defaultMessage:
      'Unavailable: no identity verification method is configured.',
  },
});
