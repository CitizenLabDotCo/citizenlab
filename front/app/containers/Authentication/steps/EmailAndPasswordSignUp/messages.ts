import { defineMessages } from 'react-intl';

export default defineMessages({
  backToSignUpOptions: {
    id: 'app.containers.SignUp.backToSignUpOptions',
    defaultMessage: 'Go back to sign up options',
  },
  goToLogIn: {
    id: 'app.containers.SignUp.goToLogIn',
    defaultMessage: 'Already have an account? {goToOtherFlowLink}',
  },
  profanityError: {
    id: 'app.containers.SignUp.profanityError',
    defaultMessage:
      'You may have used one or more words that are considered profanity by {guidelinesLink}. Please alter your text to remove any profanities that might be present.',
  },
  guidelinesLinkText: {
    id: 'app.containers.SignUp.guidelinesLinkText',
    defaultMessage: 'our guidelines',
  },
});
