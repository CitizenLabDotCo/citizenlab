import { omitBy, isNil } from 'lodash-es';
import { stringify } from 'qs';
import { RouteType } from 'routes';

import { AUTH_PATH } from 'containers/App/constants';
import { isProjectContext } from 'containers/Authentication/steps/Verification/utils';
import {
  AuthenticationData,
  SignUpInError,
} from 'containers/Authentication/typings';

export interface SSOProviderMap {
  azureactivedirectory: 'azureactivedirectory';
  azureactivedirectory_b2c: 'azureactivedirectory_b2c';
  facebook: 'facebook';
  franceconnect: 'franceconnect';
  google: 'google';
  clave_unica: 'clave_unica';
  hoplr: 'hoplr';
  criipto: 'criipto';
  fake_sso: 'fake_sso';
}

export type SSOProvider = SSOProviderMap[keyof SSOProviderMap];

// Note: these are url parameters so therefore all typed as strings
export interface SSOParams {
  sso_response: 'true';
  sso_flow: 'signup' | 'signin';
  sso_pathname: RouteType;
  sso_verification?: string;
  sso_verification_action?: string;
  sso_verification_id?: string;
  sso_verification_type?: string;
  error_code?: SignUpInError;
  // TODO: Refactoring + better integration of verification into new
  // registration flow when there is BE support
  verification_success?: string;
}

const setHrefVienna = () => {
  window.location.href = `${AUTH_PATH}/vienna_citizen`;
};

export const handleOnSSOClick = (
  provider: SSOProvider,
  metaData: AuthenticationData,
  verification: boolean,
  flow: 'signup' | 'signin'
) => {
  if (metaData?.successAction) {
    localStorage.setItem(
      'auth_success_action',
      JSON.stringify(metaData.successAction)
    );
  }

  provider === 'id_vienna_saml'
    ? setHrefVienna()
    : setHref(provider, metaData, verification, flow);
};

function setHref(
  provider: SSOProvider,
  authenticationData: AuthenticationData,
  verification: boolean,
  flow: 'signup' | 'signin'
) {
  const { context } = authenticationData;

  const pathname = window.location.pathname as RouteType;
  const ssoParams: SSOParams = {
    sso_response: 'true',
    sso_flow: flow,
    sso_pathname: pathname, // Also used by back-end to set user.locale following succesful signup
    sso_verification: verification === true ? 'true' : undefined,
    sso_verification_action: context?.action,
    sso_verification_id: isProjectContext(context) ? context.id : undefined,
    sso_verification_type: context?.type,
  };
  const urlSearchParams = stringify(omitBy(ssoParams, isNil));
  window.location.href = `${AUTH_PATH}/${provider}?${urlSearchParams}`;
}
