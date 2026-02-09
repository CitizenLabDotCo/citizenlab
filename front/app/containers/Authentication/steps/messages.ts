import { defineMessages } from 'react-intl';

export default defineMessages({
  continue: {
    id: 'app.containers.NewAuthModal.steps.continue',
    defaultMessage: 'Continue',
  },
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
  password: {
    id: 'app.containers.NewAuthModal.steps.Password.password',
    defaultMessage: 'Password',
  },
  noPasswordError: {
    id: 'app.containers.NewAuthModal.steps.Password.noPasswordError',
    defaultMessage: 'Please enter your password',
  },
  forgotPassword: {
    id: 'app.containers.NewAuthModal.steps.Password.forgotPassword',
    defaultMessage: 'Forgot password?',
  },
  rememberMe: {
    id: 'app.containers.NewAuthModal.steps.Password.rememberMe',
    defaultMessage: 'Remember me',
  },
  rememberMeTooltip: {
    id: 'app.containers.NewAuthModal.steps.Password.rememberMeTooltip',
    defaultMessage: 'Do not select if using a public computer',
  },
  firstNamesLabel: {
    id: 'app.containers.SignUp.firstNamesLabel',
    defaultMessage: 'First names',
  },
  emptyFirstNameError: {
    id: 'app.containers.SignUp.emptyFirstNameError',
    defaultMessage: 'Enter your first name',
  },
  lastNameLabel: {
    id: 'app.containers.SignUp.lastNameLabel',
    defaultMessage: 'Last name',
  },
  emptyLastNameError: {
    id: 'app.containers.SignUp.emptyLastNameError',
    defaultMessage: 'Enter your last name',
  },
  adminOptions: {
    id: 'app.containers.SignUp.adminOptions2',
    defaultMessage: 'For admins and project managers',
  },
});
