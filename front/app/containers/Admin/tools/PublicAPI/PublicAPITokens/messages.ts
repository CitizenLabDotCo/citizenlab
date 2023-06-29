import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.containers.Admin.tools.apiTokens.title',
    defaultMessage: 'Public API tokens',
  },
  description: {
    id: 'app.containers.Admin.tools.apiTokens.description',
    defaultMessage:
      'Manage your API tokens for our public API. For more information, see our {link}.',
  },
  link: {
    id: 'app.containers.Admin.tools.apiTokens.link',
    defaultMessage: 'API documentation',
  },
  linkUrl: {
    id: 'app.containers.Admin.tools.apiTokens.linkUrl',
    defaultMessage: 'https://developers.citizenlab.co/reference-api-docs/',
  },
  name: {
    id: 'app.containers.Admin.tools.apiTokens.name',
    defaultMessage: 'Name',
  },
  secret: {
    id: 'app.containers.Admin.tools.apiTokens.secret',
    defaultMessage: 'Secret',
  },
  createdAt: {
    id: 'app.containers.Admin.tools.apiTokens.createdAt',
    defaultMessage: 'Created',
  },
  lastUsedAt: {
    id: 'app.containers.Admin.tools.apiTokens.lastUsedAt',
    defaultMessage: 'Last used',
  },
  delete: {
    id: 'app.containers.Admin.tools.apiTokens.delete',
    defaultMessage: 'Delete token',
  },
  deleteConfirmation: {
    id: 'app.containers.Admin.tools.apiTokens.deleteConfirmation',
    defaultMessage: 'Are you sure you want to delete this token?',
  },
  createTokenButton: {
    id: 'app.containers.Admin.tools.apiTokens.createTokenButton',
    defaultMessage: 'Create new token',
  },
  noTokens: {
    id: 'app.containers.Admin.tools.apiTokens.noTokens',
    defaultMessage: 'You do not have any tokens yet.',
  },
  createTokenTitle: {
    id: 'app.containers.Admin.tools.apiTokens.createTokenTitle',
    defaultMessage: 'Create a new token',
  },
  createTokenDescription: {
    id: 'app.containers.Admin.tools.apiTokens.createTokenDescription',
    defaultMessage: 'Create a new token to use on our public API.',
  },
  createTokenName: {
    id: 'app.containers.Admin.tools.apiTokens.createTokenName',
    defaultMessage: 'Name',
  },
  createTokenNamePlaceholder: {
    id: 'app.containers.Admin.tools.apiTokens.createTokenNamePlaceholder',
    defaultMessage: 'Give your token a name',
  },
  createTokenModalButton: {
    id: 'app.containers.Admin.tools.apiTokens.createTokenButton',
    defaultMessage: 'Create token',
  },
  createTokenModalCancel: {
    id: 'app.containers.Admin.tools.apiTokens.createTokenCancel',
    defaultMessage: 'Cancel',
  },
  createTokenModalError: {
    id: 'app.containers.Admin.tools.apiTokens.createTokenError',
    defaultMessage: 'Provide a name for your token',
  },
  createTokenModalSuccess: {
    id: 'app.containers.Admin.tools.apiTokens.createTokenSuccess',
    defaultMessage: 'Your token has been created',
  },
  createTokenModalSuccessDescription: {
    id: 'app.containers.Admin.tools.apiTokens.createTokenSuccessDescription',
    defaultMessage:
      'Your token has been created. Please copy the secret below. You will not be able to see it again.',
  },
  createTokenModalSuccessCopy: {
    id: 'app.containers.Admin.tools.apiTokens.createTokenSuccessCopy',
    defaultMessage: 'Copy secret',
  },
  createTokenModalSuccessClose: {
    id: 'app.containers.Admin.tools.apiTokens.createTokenSuccessClose',
    defaultMessage: 'Close',
  },
  createTokenModalSuccessCopySuccess: {
    id: 'app.containers.Admin.tools.apiTokens.createTokenSuccessCopySuccess',
    defaultMessage: 'Copied!',
  },
});
