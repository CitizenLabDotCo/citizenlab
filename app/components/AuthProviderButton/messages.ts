
import { defineMessages } from 'react-intl';

export default defineMessages({
  termsAndConditions: {
    id: 'app.components.AuthProviderButton.termsAndConditions',
    defaultMessage: 'terms and conditions',
  },
  acceptTermsAndConditions: {
    id: 'app.components.AuthProviderButton.acceptTermsAndConditions',
    defaultMessage: 'Accept our {tacLink} to sign up via {loginMechanismName}',
  },
  signUpButtonAltText: {
    id: 'app.components.AuthProviderButton.signUpButtonAltText',
    defaultMessage: 'Sign up with {loginMechanismName}',
  },
  signInButtonAltText: {
    id: 'app.components.AuthProviderButton.signInButtonAltText',
    defaultMessage: 'Sign in with {loginMechanismName}',
  },
  alreadyAcceptTermsAndConditions: {
    id: 'app.components.AuthProviderButton.alreadyAcceptTermsAndConditions',
    defaultMessage: 'I\'ve already accepted the {tacLink} and {ppLink}',
  },
  privacyPolicy: {
    id: 'app.components.AuthProviderButton.privacyPolicy',
    defaultMessage: 'privacy policy',
  },
  privacyChecks: {
    id: 'app.components.AuthProviderButton.privacyChecks',
    defaultMessage: 'Before you sign up with {loginMechanismName}, review and consent to our policies :',
  },
  tacApproval: {
    id: 'app.components.AuthProviderButton.tacApproval',
    defaultMessage: 'Check here to confirm that you have read and agree to our {tacLink}',
  },
  privacyApproval: {
    id: 'app.components.AuthProviderButton.privacyApproval',
    defaultMessage: 'Check here to confirm that you have read and agree to our {ppLink}',
  },
  emailApproval: {
    id: 'app.components.AuthProviderButton.emailApproval',
    defaultMessage: 'Check here to confirm that you agree receiving emails from this platform. You can select which emails you wish to receive from your user settings.',
  },
});
