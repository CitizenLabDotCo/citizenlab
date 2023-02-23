import { defineMessages } from 'react-intl';

export default defineMessages({
  enterYourEmailAddress: {
    id: 'app.containers.NewAuthModal.steps.enterYourEmailAddress',
    defaultMessage: 'Enter your email address to continue.',
  },
  email: {
    id: 'app.containers.NewAuthModal.steps.email',
    defaultMessage: 'Email',
  },
  continue: {
    id: 'app.containers.NewAuthModal.steps.continue',
    defaultMessage: 'Continue',
  },
  emailFormatError: {
    id: 'app.containers.NewAuthModal.steps.emailFormatError',
    defaultMessage:
      'Provide an email address in the correct format, for example name@provider.com',
  },
  emailMissingError: {
    id: 'app.containers.NewAuthModal.steps.emailMissingError',
    defaultMessage: 'Provide an email address',
  },
});
