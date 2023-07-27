import { defineMessages } from 'react-intl';

export default defineMessages({
  beforeYouParticipate: {
    id: 'app.containers.NewAuthModal.beforeYouParticipate',
    defaultMessage: 'Before you participate',
  },
  logIn: {
    id: 'app.containers.NewAuthModal.logIn',
    defaultMessage: 'Log in',
  },
  confirmYourEmail: {
    id: 'app.containers.NewAuthModal.confirmYourEmail',
    defaultMessage: 'Confirm your email',
  },
  signUp: {
    id: 'app.containers.SignUp.signUp2',
    defaultMessage: 'Sign up',
  },
  invitationError: {
    id: 'app.containers.SignUp.invitationError',
    defaultMessage: 'Your invitation has expired or has already been redeemed.',
  },
  verifyYourIdentity: {
    id: 'app.components.VerificationModal.verifyYourIdentity',
    defaultMessage: 'Verify your identity',
  },
  completeYourProfile: {
    id: 'app.containers.NewAuthModal.completeYourProfile',
    defaultMessage: 'Complete your profile',
  },
  unknownError: {
    id: 'app.containers.SignUp.unknownError',
    defaultMessage: 'Something went wrong. Please try again later.',
  },
  signInError: {
    id: 'app.containers.SignIn.signInError',
    defaultMessage: 'No account was found for the provided credentials',
  },
  emailTakenAndUserCanBeVerified: {
    id: 'app.containers.AuthProviders.emailTakenAndUserCanBeVerified',
    defaultMessage:
      'An account with this email already exists. You can sign out, log in with this email address and verify your account on the settings page.',
  },
  franceConnectMergingFailed: {
    id: 'app.components.AuthProviders.franceConnectMergingFailed',
    defaultMessage:
      'An account already exists with this email address.{br}{br}You cannot access the platform using FranceConnect as the personal details do not match. To log in using FranceConnect, you will have to first change your first name or last name on this platform to match your official details.{br}{br}You can log in as you normally do below.',
  },
});
