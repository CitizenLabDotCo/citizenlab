import { AUTH_PATH } from 'containers/App/constants';
import { ISignUpInMetaData } from 'components/SignUpIn';
import { stringify } from 'qs';
import { omitBy, isNil } from 'lodash-es';

export type SSOProvider =
  | 'google'
  | 'facebook'
  | 'azureactivedirectory'
  | 'franceconnect';

export interface SSOParams {
  sso_response: 'true';
  sso_flow: 'signup' | 'signin';
  sso_pathname: string;
  sso_verification?: string;
  sso_verification_action?: string;
  sso_verification_id?: string;
  sso_verification_type?: string;
}

export const handleOnSSOClick = (
  provider: SSOProvider,
  metaData: ISignUpInMetaData
) => {
  const { pathname, verification, verificationContext } = metaData;
  const ssoParams: SSOParams = {
    sso_response: 'true',
    sso_flow: metaData.flow,
    sso_pathname: pathname,
    sso_verification: verification === true ? 'true' : undefined,
    sso_verification_action: verificationContext?.action,
    sso_verification_id: verificationContext?.id,
    sso_verification_type: verificationContext?.type,
  };
  const urlSearchParams = stringify(omitBy(ssoParams, isNil));
  window.location.href = `${AUTH_PATH}/${provider}?${urlSearchParams}`;
};
