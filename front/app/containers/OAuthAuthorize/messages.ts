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
  scopeMcpAccess: {
    id: 'containers.OAuthAuthorize.scopeMcpAccess',
    defaultMessage:
      'Read and manage platform data on your behalf via the assistant integration.',
  },
  scopeFallback: {
    id: 'containers.OAuthAuthorize.scopeFallback',
    defaultMessage: 'Access the "{scope}" scope.',
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
