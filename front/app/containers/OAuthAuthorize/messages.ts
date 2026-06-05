import { defineMessages } from 'react-intl';

export default defineMessages({
  pageTitle: {
    id: 'containers.OAuthAuthorize.pageTitle',
    defaultMessage: 'Authorize access',
  },
  authorizeHeading: {
    id: 'containers.OAuthAuthorize.authorizeHeading',
    defaultMessage: 'Authorize {clientName}',
  },
  authorizeExplanation: {
    id: 'containers.OAuthAuthorize.authorizeExplanation2',
    defaultMessage:
      '{clientName} is requesting access to your account on this platform. If you authorize, it will be able to:',
  },
  scopeMcpAccessTitle: {
    id: 'containers.OAuthAuthorize.scopeMcpAccessTitle',
    defaultMessage: 'Read and manage platform data',
  },
  scopeMcpAccessDetail: {
    id: 'containers.OAuthAuthorize.scopeMcpAccessDetail',
    defaultMessage: 'Acts on your behalf via the assistant integration.',
  },
  scopeFallbackTitle: {
    id: 'containers.OAuthAuthorize.scopeFallbackTitle',
    defaultMessage: 'Access the "{scope}" scope',
  },
  scopeFallbackDetail: {
    id: 'containers.OAuthAuthorize.scopeFallbackDetail',
    defaultMessage: 'requested by this application.',
  },
  inControlTitle: {
    id: 'containers.OAuthAuthorize.inControlTitle',
    defaultMessage: "You're in control",
  },
  inControlDetail: {
    id: 'containers.OAuthAuthorize.inControlDetail',
    defaultMessage:
      'You can revoke access at any time from your account settings.',
  },
  authorizeButton: {
    id: 'containers.OAuthAuthorize.authorizeButton',
    defaultMessage: 'Authorize',
  },
  denyButton: {
    id: 'containers.OAuthAuthorize.denyButton',
    defaultMessage: 'Cancel',
  },
  signInPrompt: {
    id: 'containers.OAuthAuthorize.signInPrompt',
    defaultMessage: 'Please sign in to continue authorizing access.',
  },
  signInButton: {
    id: 'containers.OAuthAuthorize.signInButton',
    defaultMessage: 'Sign in',
  },
  invalidRequestHeading: {
    id: 'containers.OAuthAuthorize.invalidRequestHeading',
    defaultMessage: 'This authorization request is invalid',
  },
  invalidRequestExplanation: {
    id: 'containers.OAuthAuthorize.invalidRequestExplanation',
    defaultMessage:
      'The request is missing information or has expired. Please start again from the application you were using.',
  },
});
