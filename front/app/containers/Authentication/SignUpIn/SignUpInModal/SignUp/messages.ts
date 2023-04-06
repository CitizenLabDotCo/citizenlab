import { defineMessages } from 'react-intl';

export default defineMessages({
  confirmYourAccount: {
    id: 'app.components.ConfirmationModal.confirmYourAccount',
    defaultMessage: 'Confirm your Email Address',
  },
  tokenLabel: {
    id: 'app.containers.SignUp.tokenLabel',
    defaultMessage: 'Invitation code',
  },
  emptyTokenError: {
    id: 'app.containers.SignUp.emptyTokenError',
    defaultMessage: 'Enter your invitation code',
  },
  tokenNotFoundError: {
    id: 'app.containers.SignUp.tokenNotFoundError',
    defaultMessage: 'The invitation code could not be found',
  },
  tokenAlreadyAcceptedError: {
    id: 'app.containers.SignUp.tokenAlreadyAcceptedError',
    defaultMessage: 'The invitation has already been redeemed',
  },
  emailLabel: {
    id: 'app.containers.SignUp.emailLabel',
    defaultMessage: 'Email',
  },
  emailOrPhoneLabel: {
    id: 'app.containers.SignUp.emailOrPhoneLabel',
    defaultMessage: 'Email or phone',
  },
  emailError: {
    id: 'app.containers.SignUp.emailError',
    defaultMessage:
      'Enter an email address in the correct format, like name@example.com',
  },
  emailOrPhoneNumberError: {
    id: 'app.containers.SignUp.emailOrPhoneNumberError',
    defaultMessage:
      'Enter an email address or a phone number in the correct format',
  },
  passwordLabel: {
    id: 'app.containers.SignUp.passwordLabel',
    defaultMessage: 'Password',
  },
  continue: {
    id: 'app.containers.SignUp.continue',
    defaultMessage: 'Continue',
  },
  nextStep: {
    id: 'app.containers.SignUp.nextStep',
    defaultMessage: 'Next step',
  },
  submit: {
    id: 'app.containers.SignUp.submit',
    defaultMessage: 'Complete your profile',
  },
  skip: {
    id: 'app.containers.SignUp.skip',
    defaultMessage: 'Skip this step',
  },
  unknownError: {
    id: 'app.containers.SignUp.unknownError',
    defaultMessage: 'Something went wrong. Please try again later.',
  },
  or: {
    id: 'app.containers.SignUp.or',
    defaultMessage: 'or',
  },
  whatIsFranceConnect: {
    id: 'app.containers.SignUp.whatIsFranceConnect',
    defaultMessage: 'What is FranceConnect?',
  },
  somethingWentWrongText: {
    id: 'app.containers.SignUp.somethingWentWrongText',
    defaultMessage:
      'Something went wrong while trying to create your account. Please try again in a few minutes.',
  },
  headerSubtitle: {
    id: 'app.containers.SignUp.headerSubtitle',
    defaultMessage: 'Step {activeStepNumber} of {totalStepsCount}: {stepName}',
  },
  createYourAccount: {
    id: 'app.containers.SignUp.createYourAccount',
    defaultMessage: 'Create your account',
  },
  verifyYourIdentity: {
    id: 'app.containers.SignUp.verifyYourIdentity',
    defaultMessage: 'Verify your identity',
  },
  completeYourProfile: {
    id: 'app.containers.SignUp.completeYourProfile',
    defaultMessage: 'Complete your profile',
  },
  completeSignUp: {
    id: 'app.containers.SignUp.completeSignUp',
    defaultMessage: 'Complete sign up',
  },
  signUpSuccess: {
    id: 'app.containers.SignUp.signUpSuccess',
    defaultMessage: 'You have signed up successfully!',
  },
  close: {
    id: 'app.containers.SignUp.close',
    defaultMessage: 'Close',
  },
  invitationError: {
    id: 'app.containers.SignUp.invitationError',
    defaultMessage: 'Your invitation has expired or has already been redeemed.',
  },
});
