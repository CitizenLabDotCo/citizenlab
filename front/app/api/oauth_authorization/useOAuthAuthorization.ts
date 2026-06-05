import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import oauthAuthorizationKeys from './keys';
import {
  IOAuthAuthorization,
  OAuthAuthorizationKeys,
  OAuthAuthorizationParams,
} from './types';

// Reads the pending OAuth authorization (client app + requested scopes) so the
// SPA can render a branded consent screen. Not cached/retried: the params come
// straight from the client redirect and the result is single-use.
const useOAuthAuthorization = (
  params: OAuthAuthorizationParams,
  { enabled = true }: { enabled?: boolean } = {}
) => {
  return useQuery<
    IOAuthAuthorization,
    CLErrors,
    IOAuthAuthorization,
    OAuthAuthorizationKeys
  >({
    queryKey: oauthAuthorizationKeys.item(params),
    queryFn: () =>
      fetcher<IOAuthAuthorization>({
        path: '/oauth_authorization',
        action: 'get',
        queryParams: params,
      }),
    enabled: enabled && !!params.client_id,
    retry: false,
    cacheTime: 0,
  });
};

export default useOAuthAuthorization;
