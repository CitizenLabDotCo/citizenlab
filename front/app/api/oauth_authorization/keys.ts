import { QueryKeys } from 'utils/cl-react-query/types';

import { OAuthAuthorizationParams } from './types';

const baseKey = {
  type: 'oauth_authorization',
};

const oauthAuthorizationKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (parameters: OAuthAuthorizationParams) => [
    { ...baseKey, operation: 'item', parameters },
  ],
} satisfies QueryKeys;

export default oauthAuthorizationKeys;
