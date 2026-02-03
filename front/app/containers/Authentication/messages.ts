import { defineMessages } from 'react-intl';

export default defineMessages({
  beforeYouParticipate: {
    id: 'app.containers.NewAuthModal.beforeYouParticipate',
    defaultMessage: 'Before you participate',
  },
  beforeYouFollow: {
    id: 'app.containers.NewAuthModal.beforeYouFollow',
    defaultMessage: 'Before you follow',
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
  invitationErrorText: {
    id: 'app.containers.SignUp.invitationErrorText',
    defaultMessage:
      'Your invitation has expired or has already been used. If you have already used the invitation link to create an account, try signing in. Otherwise, sign up to create a new account.',
  },
  verifyYourIdentity: {
    id: 'app.components.VerificationModal.verifyYourIdentity',
    defaultMessage: 'Verify your identity',
  },
  completeYourProfile: {
    id: 'app.containers.NewAuthModal.completeYourProfile',
    defaultMessage: 'Complete your profile',
  },
  whatAreYouInterestedIn: {
    id: 'app.containers.NewAuthModal.whatAreYouInterestedIn',
    defaultMessage: 'What are you interested in?',
  },
  unknownError: {
    id: 'app.containers.SignUp.unknownError',
    defaultMessage: 'Something went wrong. Please try again later.',
  },
  signInError: {
    id: 'app.containers.SignIn.signInError2',
    defaultMessage:
      "The provided information is not correct. Click 'Forgot Password?' to reset your password, or {createAnAccountLink}.",
  },
  createAnAccountLink: {
    id: 'app.containers.SignIn.createAnAccountLink',
    defaultMessage: 'create an account',
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
  underMinimumAgeVerificationFailed: {
    id: 'app.components.AuthProviders.nemlogInUnderMinimumAgeVerificationFailed',
    defaultMessage:
      'You must be the specified minimum age or above to be verified.',
  },
  livesOutsideAreaVerificationFailed: {
    id: 'app.components.AuthProviders.livesOutsideAreaVerificationFailed',
    defaultMessage:
      'You cannot be verified as your address is not in the area required.',
  },
  noMatchVerificationFailed: {
    id: 'app.components.AuthProviders.noMatchVerificationFailed',
    defaultMessage: 'You cannot be verified.',
  },
  serviceErrorVerificationFailed: {
    id: 'app.components.AuthProviders.serviceErrorVerificationFailed',
    defaultMessage:
      'You cannot be verified as there is an error with the verification service.',
  },
  underMinimumAgeAuthFailed: {
    id: 'app.components.AuthProviders.underMinimumAgeAuthFailed',
    defaultMessage:
      'You cannot login as you do not meet the specified minimum age to participate.',
  },
  livesOutsideAreaAuthFailed: {
    id: 'app.components.AuthProviders.livesOutsideAreaAuthFailed',
    defaultMessage:
      'You cannot login as your address is not in the area required.',
  },
  noMatchAuthFailed: {
    id: 'app.components.AuthProviders.noMatchAuthFailed',
    defaultMessage: 'You cannot login as we cannot successfully verify you.',
  },
  serviceErrorAuthFailed: {
    id: 'app.components.AuthProviders.serviceErrorAuthFailed',
    defaultMessage:
      'You cannot login as there is an error with the verification service.',
  },
  verificationRequired: {
    id: 'app.components.AuthProviders.verificationRequired',
    defaultMessage: 'Verification required',
  },
  youCantParticipate: {
    id: 'app.containers.NewAuthModal.youCantParticipate',
    defaultMessage: "You can't participate",
  },
  createAnAccount: {
    id: 'app.containers.Authentication.createAnAccount',
    defaultMessage: 'Create an account',
  },
});
