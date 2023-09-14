import { AUTH_PATH } from 'containers/App/constants';
import {
  AuthenticationData,
  SignUpInError,
} from 'containers/Authentication/typings';
import { stringify } from 'qs';
import { omitBy, isNil } from 'lodash-es';
import { isProjectContext } from 'containers/Authentication/steps/Verification/utils';

export interface SSOProviderMap {
  azureactivedirectory: 'azureactivedirectory';
  facebook: 'facebook';
  franceconnect: 'franceconnect';
  google: 'google';
  clave_unica: 'clave_unica';
  hoplr: 'hoplr';
}

export type SSOProvider = SSOProviderMap[keyof SSOProviderMap];

// Note: these are url parameters so therefore all typed as strings
export interface SSOParams {
  sso_response: 'true';
  sso_flow: 'signup' | 'signin';
  sso_pathname: string;
  sso_verification?: string;
  sso_verification_action?: string;
  sso_verification_id?: string;
  sso_verification_type?: string;
  error_code?: SignUpInError;
}

const setHrefVienna = () => {
  window.location.href = `${AUTH_PATH}/vienna_citizen`;
};

export const handleOnSSOClick = (
  provider: SSOProvider,
  metaData: AuthenticationData,
  verification: boolean
) => {
  provider === 'id_vienna_saml'
    ? setHrefVienna()
    : setHref(provider, metaData, verification);
};

function setHref(
  provider: SSOProvider,
  authenticationData: AuthenticationData,
  verification: boolean
) {
  const { context, flow } = authenticationData;

  const pathname = window.location.pathname;

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
