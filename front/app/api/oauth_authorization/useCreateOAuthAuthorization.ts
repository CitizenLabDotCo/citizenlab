import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { IOAuthAuthorizationRedirect, OAuthAuthorizationParams } from './types';

// Approves the consent: creates the authorization grant and returns the client
// redirect URI (carrying ?code=&state=) for the SPA to navigate to.
const createOAuthAuthorization = (params: OAuthAuthorizationParams) =>
  fetcher<IOAuthAuthorizationRedirect>({
    path: '/oauth_authorization',
    action: 'post',
    body: params,
  });

const useCreateOAuthAuthorization = () => {
  return useMutation<
    IOAuthAuthorizationRedirect,
    CLErrors,
    OAuthAuthorizationParams
  >({
    mutationFn: createOAuthAuthorization,
  });
};

export default useCreateOAuthAuthorization;
