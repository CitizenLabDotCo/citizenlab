import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.containers.DisabledAccount.title',
    defaultMessage: 'Your account has been temporarily disabled',
  },
  text: {
    id: 'app.containers.DisabledAccount.text2',
    defaultMessage:
      'Your account on the participation platform of {orgName} has been temporarily disabled for a violation of community guidelines. For more information on this, you can consult the {TermsAndConditions}.',
  },
  termsAndConditions: {
    id: 'app.containers.DisabledAccount.termsAndConditions',
    defaultMessage: 'terms & conditions',
  },
  bottomText: {
    id: 'app.containers.DisabledAccount.bottomText',
    defaultMessage: 'You can sign in again from {date}.',
  },
});
