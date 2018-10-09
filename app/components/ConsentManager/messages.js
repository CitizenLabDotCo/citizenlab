import { defineMessages } from 'react-intl';

export default defineMessages({
  mainText: {
    id: 'app.components.ConsentManager.Banner.mainText',
    defaultMessage: 'By navigating the platform, you agree to our {policyLink}',
  },
  policyLink: {
    id: 'app.components.ConsentManager.Banner.policyLink',
    defaultMessage: 'Cookie Policy',
  },
  subText: {
    id: 'app.components.ConsentManager.Banner.subText',
    defaultMessage: 'Access your preferences at any time by visiting "Cookie settings" at the bottom of the page',
  },
  manage: {
    id: 'app.components.ConsentManager.Banner.manage',
    defaultMessage: 'Manage',
  },
  accept: {
    id: 'app.components.ConsentManager.Banner.accept',
    defaultMessage: 'Accept',
  },
  title: {
    id: 'app.components.ConsentManager.Modal.PreferencesDialog.title',
    defaultMessage: 'Your cookie preferences',
  },
  modalLabel: {
    id: 'app.components.ConsentManager.Modal.PreferencesDialog.modalLabel',
    defaultMessage: 'Your cookie preferences',
  },
  functional: {
    id: 'app.components.ConsentManager.Modal.PreferencesDialog.functional',
    defaultMessage: 'Functional',
  },
  functionalPurpose: {
    id: 'app.components.ConsentManager.Modal.PreferencesDialog.functionalPurpose',
    defaultMessage: 'Required to enable and monitor basic functionalities of the website. Some tools listed here might not apply to you. Please refer to our Cookie Policy for more information.',
  },
  analytics: {
    id: 'app.components.ConsentManager.Modal.PreferencesDialog.analytics',
    defaultMessage: 'Marketing and analytics',
  },
  analyticsPurpose: {
    id: 'app.components.ConsentManager.Modal.PreferencesDialog.analyticsPurpose',
    defaultMessage: 'We use this tracking to understand better how you use the platform in order to learn and improve your navigation. This information is only used in mass analytics, and in no way to track individuals.',
  },
  advertising: {
    id: 'app.components.ConsentManager.Modal.PreferencesDialog.advertising',
    defaultMessage: 'Advertising',
  },
  advertisingPurpose: {
    id: 'app.components.ConsentManager.Modal.PreferencesDialog.advertisingPurpose',
    defaultMessage: 'To personalize and measure the effectiveness of advertising campains of our website. We will not show any advertising on this platform, but the following services might serve you a personalized ad based on the pages you visit on our site.',
  },
  tools: {
    id: 'app.components.ConsentManager.Modal.PreferencesDialog.tools',
    defaultMessage: 'Tools',
  },
  allow: {
    id: 'app.components.ConsentManager.Modal.PreferencesDialog.allow',
    defaultMessage: 'Allow',
  },
  disallow: {
    id: 'app.components.ConsentManager.Modal.PreferencesDialog.disallow',
    defaultMessage: 'Disallow',
  },
  ariaRadioGroup: {
    id: 'app.components.ConsentManager.Modal.PreferencesDialog.ariaRadioGroup',
    defaultMessage: 'Allow {category} tracking?',
  },
  save: {
    id: 'app.components.ConsentManager.Modal.PreferencesDialog.save',
    defaultMessage: 'Save',
  },
  cancel: {
    id: 'app.components.ConsentManager.Modal.PreferencesDialog.cancel',
    defaultMessage: 'Cancel',
  },
  confirmation: {
    id: 'app.components.ConsentManager.Modal.CancelDialog.confirmation',
    defaultMessage: 'If you cancel, your preferences will be lost.',
  },
  confirm: {
    id: 'app.components.ConsentManager.Modal.CancelDialog.confirm',
    defaultMessage: 'Confirm',
  },
  back: {
    id: 'app.components.ConsentManager.Modal.CancelDialog.back',
    defaultMessage: 'Go Back',
  },
});
