import { defineMessages } from 'react-intl';

export default defineMessages({
  enterYourEmailAddress: {
    id: 'app.containers.NewAuthModal.steps.EmailSignUp.enterYourEmailAddress',
    defaultMessage: 'Enter your email address to continue.',
  },
  email: {
    id: 'app.containers.NewAuthModal.steps.EmailSignUp.email',
    defaultMessage: 'Email',
  },
  emailFormatError: {
    id: 'app.containers.NewAuthModal.steps.EmailSignUp.emailFormatError',
    defaultMessage:
      'Provide an email address in the correct format, for example name@provider.com',
  },
  emailMissingError: {
    id: 'app.containers.NewAuthModal.steps.EmailSignUp.emailMissingError',
    defaultMessage: 'Provide an email address',
  },
});
