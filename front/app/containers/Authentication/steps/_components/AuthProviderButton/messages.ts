import { defineMessages } from 'react-intl';

export default defineMessages({
  signUpButtonAltText: {
    id: 'app.components.AuthProviders.signUpButtonAltText',
    defaultMessage: 'Sign up with {loginMechanismName}',
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
  iHaveReadAndAgreeToTerms: {
    id: 'app.containers.SignUp.iHaveReadAndAgreeToTerms',
    defaultMessage: 'I have read and agree to {link}.',
  },
  iHaveReadAndAgreeToPrivacy: {
    id: 'app.containers.SignUp.iHaveReadAndAgreeToPrivacy',
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
