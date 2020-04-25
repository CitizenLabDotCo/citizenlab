import { AUTH_PATH } from 'containers/App/constants';
import { ISignUpInMetaData } from 'components/SignUpIn';
import { stringify } from 'qs';
import { endsWith } from 'utils/helperUtils';

export type SSOProvider = 'google' | 'facebook' | 'azureactivedirectory' | 'franceconnect';

export interface SSOParams {
  sso_response: 'true';
  sso_flow: 'signup' | 'signin';
  sso_pathname: string;
  sso_verify: string;
}

export const handleOnSSOClick = (provider: SSOProvider, metaData: ISignUpInMetaData) => {
  const { pathname, verification } = metaData;
  const ssoParams: SSOParams = {
    sso_response: 'true',
    sso_flow: metaData.flow,
    sso_pathname: !endsWith(pathname, ['sign-up', 'sign-in', 'complete-signup', 'invite', 'authentication-error']) ? pathname : '/',
    sso_verify: `${verification}`
  };
  const urlSearchParams = stringify(ssoParams);
  window.location.href = `${AUTH_PATH}/${provider}?${urlSearchParams}`;
};
