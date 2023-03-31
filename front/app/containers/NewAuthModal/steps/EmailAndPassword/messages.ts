import { defineMessages } from 'react-intl';

export default defineMessages({
  goBackToLoginOptions: {
    id: 'app.containers.NewAuthModal.steps.EmailAndPassword.goBackToLoginOptions',
    defaultMessage: 'Go back to login options',
  },
  goToSignUp: {
    id: 'app.containers.NewAuthModal.steps.EmailAndPassword.goToSignUp',
    defaultMessage: "Don't have an account? {goToOtherFlowLink}",
  },
  signUp: {
    id: 'app.containers.NewAuthModal.steps.EmailAndPassword.signUp',
    defaultMessage: 'Sign up',
  },
  emailOrPhone: {
    id: 'app.containers.NewAuthModal.steps.EmailAndPassword.emailOrPhone',
    defaultMessage: 'Email or phone',
  },
  emailOrPhoneMissingError: {
    id: 'app.containers.NewAuthModal.steps.EmailAndPassword.emailOrPhoneMissingError',
    defaultMessage: 'Provide an email address or phone number',
  },
  emailOrPhoneNumberError: {
    id: 'app.containers.NewAuthModal.steps.EmailAndPassword.emailOrPhoneNumberError',
    defaultMessage:
      'Enter an email address or a phone number in the correct format',
  },
});
