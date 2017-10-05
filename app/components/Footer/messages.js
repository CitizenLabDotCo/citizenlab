import { defineMessages } from 'react-intl';

export default defineMessages({
  slogan: {
    id: 'app.containers.footer.slogan',
    defaultMessage: '{type, select, generic {This website is an initiative from {name}} other {This website is an initiative from the city of {name}}}',
  },
  poweredBy: {
    id: 'app.containers.footer.poweredBy',
    defaultMessage: 'Powered by',
  },
  termsLink: {
    id: 'app.containers.footer.termsLink',
    defaultMessage: 'Terms of use',
  },
  privacyLink: {
    id: 'app.containers.footer.privacyLink',
    defaultMessage: 'Privacy Policy',
  },
  cookiesLink: {
    id: 'app.containers.footer.cookiesLink',
    defaultMessage: 'Cookies Policy',
  },
  feedbackLink: {
    id: 'app.containers.footer.feedbackLink',
    defaultMessage: 'Give your opinion',
  },
});
