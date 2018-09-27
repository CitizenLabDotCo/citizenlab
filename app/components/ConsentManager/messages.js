import { defineMessages } from 'react-intl';

export default defineMessages({
  mainText: {
    id: 'app.components.ConsentManager.Banner.mainText',
    defaultMessage: 'By navigating on the platform, you’re accepting our {privacyPolicyLink}',
  },
  privacyPolicy: {
    id: 'app.components.ConsentManager.Banner.privacyPolicy',
    defaultMessage: 'Privacy Policy',
  },
  subText: {
    id: 'app.components.ConsentManager.Banner.subText',
    defaultMessage: 'To manage what you give access to, click on the button manage.',
  },
  manage: {
    id: 'app.components.ConsentManager.Banner.manage',
    defaultMessage: 'Manage',
  },
  accept: {
    id: 'app.components.ConsentManager.Banner.accept',
    defaultMessage: 'Accept',
  },
});
