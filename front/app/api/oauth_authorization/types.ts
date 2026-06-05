import { Keys } from 'utils/cl-react-query/types';

import oauthAuthorizationKeys from './keys';

export type OAuthAuthorizationKeys = Keys<typeof oauthAuthorizationKeys>;

// The OAuth 2.1 authorize-request params, forwarded by the client app on the
// consent page URL. `client_id`, `response_type` and `redirect_uri` are always
// present; the rest depend on the client (PKCE params are required by our server).
export interface OAuthAuthorizationParams {
  client_id: string;
  response_type: string;
  redirect_uri: string;
  scope?: string;
  state?: string;
  code_challenge?: string;
  code_challenge_method?: string;
}

// GET /web_api/v1/oauth_authorization
export interface IOAuthAuthorization {
  data: {
    type: 'oauth_authorization';
    attributes: {
      client_id: string;
      client_name: string;
      scopes: string[];
      redirect_uri: string;
      // The exact params to re-submit on approve.
      params: OAuthAuthorizationParams;
    };
  };
}

// POST /web_api/v1/oauth_authorization
export interface IOAuthAuthorizationRedirect {
  data: {
    type: 'oauth_authorization';
    attributes: {
      redirect_uri: string;
    };
  };
}
