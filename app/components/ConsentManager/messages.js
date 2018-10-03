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
  functional: {
    id: 'app.components.ConsentManager.Modal.functional',
    defaultMessage: 'Functional',
  },
  functionalPurpose: {
    id: 'app.components.ConsentManager.Modal.functionalPurpose',
    defaultMessage: 'Required to enable and monitor basic functionalities of the website. Some tools listed here might not apply to you. Please refer to our Cookie Policy for more information.',
  },
  analytics: {
    id: 'app.components.ConsentManager.Modal.analytics',
    defaultMessage: 'Marketing and analytics',
  },
  analyticsPurpose: {
    id: 'app.components.ConsentManager.Modal.analyticsPurpose',
    defaultMessage: 'We use this tracking to understand better how you use the platform in order to learn and improve your navigation. This information is only used in mass analytics, and in no way to track individuals.',
  },
  advertising: {
    id: 'app.components.ConsentManager.Modal.advertising',
    defaultMessage: 'Advertising',
  },
  advertisingPurpose: {
    id: 'app.components.ConsentManager.Modal.advertisingPurpose',
    defaultMessage: 'To personalize and measure the effectiveness of advertising campains of our website. We will not show any advertising on this platform, but the following services might serve you a personalized ad based on the pages you visit on our site.',
  },
});
