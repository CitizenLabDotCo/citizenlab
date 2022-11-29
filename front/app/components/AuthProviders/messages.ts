import { defineMessages } from 'react-intl';

export default defineMessages({
  franceConnectMergingFailed: {
    id: 'app.components.AuthProviders.franceConnectMergingFailed',
    defaultMessage:
      'An account already exists with this email address.{br}{br}You cannot access the platform using FranceConnect as the personal details do not match. To log in using FranceConnect, you will have to first change your first name or last name on this platform to match your official details.{br}{br}You can log in as you normally do below.',
  },
  signUpWithEmail: {
    id: 'app.components.AuthProviders.signUpWithEmail',
    defaultMessage: 'Sign up with Email',
  },
  logInWithEmail: {
    id: 'app.components.AuthProviders.logInWithEmail',
    defaultMessage: 'Log in with Email',
  },
  signUpWithPhoneOrEmail: {
    id: 'app.components.AuthProviders.signUpWithPhoneOrEmail',
    defaultMessage: 'Sign up with Phone or Email',
  },
  logInWithPhoneOrEmail: {
    id: 'app.components.AuthProviders.logInWithPhoneOrEmail',
    defaultMessage: 'Log in with Phone or Email',
  },
  continueWithGoogle: {
    id: 'app.components.AuthProviders.continueWithGoogle',
    defaultMessage: 'Continue with Google',
  },
  continueWithFacebook: {
    id: 'app.components.AuthProviders.continueWithFacebook',
    defaultMessage: 'Continue with Facebook',
  },
  continueWithAzure: {
    id: 'app.components.AuthProviders.continueWithAzure',
    defaultMessage: 'Continue with {azureProviderName}',
  },
  signUpButtonAltText: {
    id: 'app.components.AuthProviders.signUpButtonAltText',
    defaultMessage: 'Sign up with {loginMechanismName}',
  },
  goToLogIn: {
    id: 'app.components.AuthProviders.goToLogIn',
    defaultMessage: 'Already have an account? {goToOtherFlowLink}',
  },
  goToSignUp: {
    id: 'app.components.AuthProviders.goToSignUp',
    defaultMessage: "Don't have an account? {goToOtherFlowLink}",
  },
  logIn2: {
    id: 'app.components.AuthProviders.logIn2',
    defaultMessage: 'Log in',
  },
  signUp2: {
    id: 'app.components.AuthProviders.signUp2',
    defaultMessage: 'Sign up',
  },
  continue: {
    id: 'app.components.AuthProviders.continue',
    defaultMessage: 'Continue',
  },
  viennaConsentHeader: {
    id: 'app.containers.SignUp.viennaConsentHeader',
    defaultMessage: 'The following data will be transmitted:',
  },
  viennaConsentFooter: {
    id: 'app.containers.SignUp.viennaConsentFooter',
    defaultMessage:
      'You can change your profile information after sign-in. If you already have an account with the same email address on mitgestalten.wien.gv.at, it will be linked with your current account.',
  },

  viennaConsentEmail: {
    id: 'app.containers.SignUp.viennaConsentEmail',
    defaultMessage: 'Email address',
  },
  viennaConsentFirstName: {
    id: 'app.containers.SignUp.viennaConsentFirstName',
    defaultMessage: 'First name',
  },
  viennaConsentLastName: {
    id: 'app.containers.SignUp.viennaConsentLastName',
    defaultMessage: 'Last name',
  },
  viennaConsentUserName: {
    id: 'app.containers.SignUp.viennaConsentUserName',
    defaultMessage: 'User name',
  },
  viennaDataProtection: {
    id: 'app.containers.SignUp.viennaDataProtection',
    defaultMessage: 'the vienna privacy policy',
  },
  iHaveReadAndAgreeToVienna: {
    id: 'app.containers.SignUp.iHaveReadAndAgreeToVienna',
    defaultMessage:
      'I accept that the data will be used on mitgestalten.wien.gv.at. Further information can befound {link}.',
  },
  iHaveReadAndAgreeTo: {
    id: 'app.containers.SignUp.iHaveReadAndAgreeTo',
    defaultMessage: 'I have read and agree to {link}.',
  },
  theTermsAndConditions: {
    id: 'app.containers.SignUp.theTermsAndConditions',
    defaultMessage: 'the terms and conditions',
  },
  thePrivacyPolicy: {
    id: 'app.containers.SignUp.thePrivacyPolicy',
    defaultMessage: 'the privacy policy',
  },
  tacError: {
    id: 'app.containers.SignUp.tacError',
    defaultMessage: 'Please accept the terms and conditions',
  },
  privacyPolicyNotAcceptedError: {
    id: 'app.containers.SignUp.privacyPolicyNotAcceptedError',
    defaultMessage: 'Accept our privacy policy to proceed',
  },
  emailConsent: {
    id: 'app.containers.SignUp.emailConsent',
    defaultMessage:
      'By signing up, you agree to receive emails from this platform. You can select which emails you wish to receive from your user settings.',
  },
});
