import { AUTH_PATH } from 'containers/App/constants';
import { ISignUpInMetaData, TSignUpInError } from 'events/openSignUpInModal';
import { stringify } from 'qs';
import { omitBy, isNil } from 'lodash-es';
import { isProjectContext } from 'events/verificationModal';
export interface SSOProviderMap {
  azureactivedirectory: 'azureactivedirectory';
  facebook: 'facebook';
  franceconnect: 'franceconnect';
  google: 'google';
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
  error_code?: TSignUpInError;
}

export const handleOnSSOClick = (
  provider: SSOProvider,
  metaData: ISignUpInMetaData,
  setHrefFromModule?: () => void
) => {
  setHrefFromModule ? setHrefFromModule() : setHref(provider, metaData);
};

function setHref(provider: SSOProvider, metaData: ISignUpInMetaData) {
  const { pathname, verification, verificationContext } = metaData;

  const ssoParams: SSOParams = {
    sso_response: 'true',
    sso_flow: metaData.flow,
    sso_pathname: pathname, // Also used by back-end to set user.locale following succesful signup
    sso_verification: verification === true ? 'true' : undefined,
    sso_verification_action: verificationContext?.action,
    sso_verification_id: isProjectContext(verificationContext)
      ? verificationContext.id
      : undefined,
    sso_verification_type: verificationContext?.type,
  };
  const urlSearchParams = stringify(omitBy(ssoParams, isNil));
  window.location.href = `${AUTH_PATH}/${provider}?${urlSearchParams}`;
}
